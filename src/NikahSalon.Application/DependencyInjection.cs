using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NikahSalon.Application.Auth.GetCurrentUser;
using NikahSalon.Application.Auth.Login;
using NikahSalon.Application.Halls.CreateHall;
using NikahSalon.Application.Halls.DeleteHall;
using NikahSalon.Application.Halls.GetHallById;
using NikahSalon.Application.Halls.GetHalls;
using NikahSalon.Application.Halls.UpdateHall;
using NikahSalon.Application.Messages.CreateMessage;
using NikahSalon.Application.Messages.DeleteMessage;
using NikahSalon.Application.Messages.GetMessagesByRequestId;
using NikahSalon.Application.Requests.AnswerRequest;
using NikahSalon.Application.Requests.ApproveRequest;
using NikahSalon.Application.Requests.CreateRequest;
using NikahSalon.Application.Requests.DeleteRequest;
using NikahSalon.Application.Requests.GetRequestById;
using NikahSalon.Application.Requests.GetRequests;
using NikahSalon.Application.Requests.RejectRequest;
using NikahSalon.Application.Requests.UpdateRequest;
using NikahSalon.Application.Schedules.CreateSchedule;
using NikahSalon.Application.Schedules.DeleteSchedule;
using NikahSalon.Application.Schedules.GetScheduleById;
using NikahSalon.Application.Schedules.GetSchedulesByHall;
using NikahSalon.Application.Schedules.UpdateSchedule;
using NikahSalon.Application.Users.CreateUser;
using NikahSalon.Application.Users.GetUserById;
using NikahSalon.Application.Users.GetUsers;
using NikahSalon.Application.Users.UpdateUser;
using NikahSalon.Application.Dashboard.GetDashboardStats;
using NikahSalon.Application.Dashboard.GetRequestsSummary;
using NikahSalon.Application.Dashboard.GetSchedulesSummary;

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
        services.AddScoped<DeleteHallCommandHandler>();
        services.AddScoped<GetSchedulesByHallQueryHandler>();
        services.AddScoped<GetScheduleByIdQueryHandler>();
        services.AddScoped<CreateScheduleCommandHandler>();
        services.AddScoped<UpdateScheduleCommandHandler>();
        services.AddScoped<DeleteScheduleCommandHandler>();
        services.AddScoped<CreateRequestCommandHandler>();
        services.AddScoped<GetRequestsQueryHandler>();
        services.AddScoped<GetRequestByIdQueryHandler>();
        services.AddScoped<AnswerRequestCommandHandler>();
        services.AddScoped<ApproveRequestCommandHandler>();
        services.AddScoped<RejectRequestCommandHandler>();
        services.AddScoped<DeleteRequestCommandHandler>();
        services.AddScoped<UpdateRequestCommandHandler>();
        services.AddScoped<CreateMessageCommandHandler>();
        services.AddScoped<GetMessagesByRequestIdQueryHandler>();
        services.AddScoped<DeleteMessageCommandHandler>();
        services.AddScoped<GetUsersQueryHandler>();
        services.AddScoped<GetUserByIdQueryHandler>();
        services.AddScoped<CreateUserCommandHandler>();
        services.AddScoped<UpdateUserCommandHandler>();
        services.AddScoped<GetDashboardStatsQueryHandler>();
        services.AddScoped<GetRequestsSummaryQueryHandler>();
        services.AddScoped<GetSchedulesSummaryQueryHandler>();

        return services;
    }
}
