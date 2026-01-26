namespace NikahSalon.API.Middleware;

/// <summary>
/// Middleware to add security HTTP headers to all responses.
/// </summary>
public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add security headers to response
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("Referrer-Policy", "no-referrer");
        context.Response.Headers.Append("X-XSS-Protection", "0");
        context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'");

        await _next(context);
    }
}
