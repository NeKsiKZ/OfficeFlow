using System.Net;
using System.Text.Json;
using FluentValidation;
using OfficeFlow.Application.Common.Exceptions;
using OfficeFlow.Domain.Exceptions;

namespace OfficeFlow.Api.Middlewares;

public sealed class GlobalExceptionMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, payload) = exception switch
        {
            ValidationException validationException => (
                HttpStatusCode.BadRequest,
                (object)new
                {
                    message = "Validation failed.",
                    errors = validationException.Errors.Select(error => error.ErrorMessage).ToArray()
                }),
            NotFoundException notFoundException => (
                HttpStatusCode.NotFound,
                new { message = notFoundException.Message }),
            DomainException domainException => (
                HttpStatusCode.BadRequest,
                new { message = domainException.Message }),
            UnauthorizedAccessException unauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                new { message = unauthorizedAccessException.Message }),
            _ => (
                HttpStatusCode.InternalServerError,
                new { message = "An unexpected error occurred." })
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception");
        }
        else
        {
            _logger.LogWarning(exception, "Handled application exception");
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
