using MediatR;
using OfficeFlow.Application.Reports.Dtos;

namespace OfficeFlow.Application.Reports.Queries.GetManagerStats;

public sealed record GetManagerStatsQuery(
    DateTime? FromUtc = null,
    DateTime? ToUtc = null) : IRequest<ManagerStatsDto>;
