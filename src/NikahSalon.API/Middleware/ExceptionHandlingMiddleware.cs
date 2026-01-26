using System.Net;
using System.Text.Json;
using FluentValidation;
using NikahSalon.API.Models;

namespace NikahSalon.API.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        HttpStatusCode statusCode;
        string message;
        IReadOnlyList<string> errors;

        switch (ex)
        {
            case ValidationException v:
                statusCode = HttpStatusCode.BadRequest;
                message = "Validation failed.";
                errors = v.Errors.Select(e => e.ErrorMessage).ToList();
                break;
            case InvalidOperationException i:
                statusCode = HttpStatusCode.BadRequest;
                message = i.Message;
                errors = Array.Empty<string>();
                break;
            case KeyNotFoundException:
                statusCode = HttpStatusCode.NotFound;
                message = ex.Message;
                errors = Array.Empty<string>();
                break;
            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                message = ex.Message;
                errors = Array.Empty<string>();
                break;
            default:
                statusCode = HttpStatusCode.InternalServerError;
                message = "An unexpected error occurred.";
                errors = Array.Empty<string>();
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ApiResponse
        {
            Success = false,
            Message = message,
            Errors = errors
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}
