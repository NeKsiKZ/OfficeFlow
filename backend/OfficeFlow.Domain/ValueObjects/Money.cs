namespace OfficeFlow.Domain.ValueObjects;

public sealed class Money : IEquatable<Money>
{
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = null!;

    private Money()
    {
    }

    public Money(decimal amount, string currency = "PLN")
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount cannot be negative.");
        }

        if (string.IsNullOrWhiteSpace(currency))
        {
            throw new ArgumentException("Currency is required.", nameof(currency));
        }

        Amount = decimal.Round(amount, 2, MidpointRounding.AwayFromZero);
        Currency = currency.Trim().ToUpperInvariant();
    }

    public Money Add(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount + other.Amount, Currency);
    }

    public Money Multiply(decimal multiplier)
    {
        if (multiplier < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(multiplier), "Multiplier cannot be negative.");
        }

        return new Money(Amount * multiplier, Currency);
    }

    private void EnsureSameCurrency(Money other)
    {
        if (!Currency.Equals(other.Currency, StringComparison.Ordinal))
        {
            throw new InvalidOperationException($"Currency mismatch: {Currency} vs {other.Currency}.");
        }
    }

    public bool Equals(Money? other) =>
        other is not null && Amount == other.Amount && Currency == other.Currency;

    public override bool Equals(object? obj) => Equals(obj as Money);

    public override int GetHashCode() => HashCode.Combine(Amount, Currency);

    public override string ToString() => $"{Amount:0.00} {Currency}";
}
