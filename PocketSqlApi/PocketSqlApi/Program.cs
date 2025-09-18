var builder = WebApplication.CreateBuilder(args);

// Clear default configuration sources and add your custom one
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("Configuration/appsettings.json", optional: false, reloadOnChange: true);

// Allow CORS for React (Vite) dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

var app = builder.Build();

// Enable Swagger middleware in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Apply CORS
app.UseCors("AllowAllOrigins");

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();