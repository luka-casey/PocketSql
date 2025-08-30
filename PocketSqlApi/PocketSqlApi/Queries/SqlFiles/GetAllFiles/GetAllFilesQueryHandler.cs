using Dapper;
using MySqlConnector;

namespace PocketSqlApi.Queries.SqlFiles.GetAllFiles;

public class GetAllFilesQueryHandler
{
    private readonly string _connectionString;

    public GetAllFilesQueryHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<List<FileIdentifier>> Handle()
    {
        var results = new List<FileIdentifier>();

        try
        {
            var builder = new MySqlConnectionStringBuilder(_connectionString);

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            var databases = await conn.QueryAsync<string>(
                @"SELECT schema_name 
                  FROM information_schema.schemata
                  WHERE schema_name NOT IN ('information_schema','mysql','performance_schema','sys');"
            );

            foreach (var databaseName in databases)
            {
                var newbuilder = new MySqlConnectionStringBuilder(_connectionString)
                {
                    Database = databaseName
                };

                await using var newConn = new MySqlConnection(newbuilder.ConnectionString);
                await newConn.OpenAsync();

                // ✅ Check if SqlFiles table exists
                var tableExists = await newConn.ExecuteScalarAsync<int>(
                    @"SELECT COUNT(*) 
                      FROM information_schema.tables 
                      WHERE table_schema = @db 
                      AND table_name = 'SqlFiles';",
                    new { db = databaseName });

                if (tableExists == 0)
                    continue;

                // ✅ Fetch IDs
                var fileIds = await newConn.QueryAsync<int>("SELECT Id FROM SqlFiles;");

                foreach (var id in fileIds)
                {
                    results.Add(new FileIdentifier
                    {
                        DatabaseName = databaseName,
                        Id = id
                    });
                }
            }

            return results;
        }
        catch
        {
            // On error return empty list
            return new List<FileIdentifier>();
        }
    }
}
