using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NikahSalon.Application.Auth.GetCurrentUser;
using NikahSalon.Application.Auth.Login;
using NikahSalon.Application.Halls.CreateHall;
using NikahSalon.Application.Halls.GetHallById;
using NikahSalon.Application.Halls.GetHalls;
using NikahSalon.Application.Halls.UpdateHall;
using NikahSalon.Application.Messages.CreateMessage;
using NikahSalon.Application.Messages.GetMessagesByRequestId;
using NikahSalon.Application.Requests.AnswerRequest;
using NikahSalon.Application.Requests.CreateRequest;
using NikahSalon.Application.Requests.GetRequests;
using NikahSalon.Application.Schedules.GetSchedulesByHall;
using NikahSalon.Application.Schedules.UpdateSchedule;

namespace NikahSalon.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<LoginCommandValidator>();

        services.AddScoped<LoginCommandHandler>();
        services.AddScoped<GetCurrentUserQueryHandler>();
        services.AddScoped<GetHallsQueryHandler>();
        services.AddScoped<GetHallByIdQueryHandler>();
        services.AddScoped<CreateHallCommandHandler>();
        services.AddScoped<UpdateHallCommandHandler>();
        services.AddScoped<GetSchedulesByHallQueryHandler>();
        services.AddScoped<UpdateScheduleCommandHandler>();
        services.AddScoped<CreateRequestCommandHandler>();
        services.AddScoped<GetRequestsQueryHandler>();
        services.AddScoped<AnswerRequestCommandHandler>();
        services.AddScoped<CreateMessageCommandHandler>();
        services.AddScoped<GetMessagesByRequestIdQueryHandler>();

        return services;
    }
}
