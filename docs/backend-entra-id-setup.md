# HRMS Web API — Entra ID JWT Bearer integration (sample, manual apply)

> Apply these changes in the ASP.NET Web API solution (NOT in this React repo).
> Two paths are provided depending on the framework. Use the section that matches your API.
>
> Common values:
>
> - Tenant ID: `1562f007-09a4-4fcb-936b-e79246571fc7`
> - API App Client ID: `<API-CLIENT-ID>` (the API app registration, NOT the SPA)
> - Audience: `api://<API-CLIENT-ID>` (Application ID URI)
> - Required scope: `access_as_user`
> - Allowed CORS origin: `https://test.hrmsnewgen.linde.com`
>
> SECURITY: rotate the previously leaked client secret in Entra. The Web API
> only needs a secret for confidential-client flows (e.g. On-Behalf-Of). For pure
> bearer validation, **no secret is required**.

---

## Option A — ASP.NET Core 6/7/8

### 1. NuGet

```
Microsoft.Identity.Web        (>= 2.x)
```

### 2. `appsettings.json`

```jsonc
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "1562f007-09a4-4fcb-936b-e79246571fc7",
    "ClientId": "<API-CLIENT-ID>",
    "Audience": "api://<API-CLIENT-ID>"
  },
  "Cors": {
    "AllowedOrigins": [ "https://test.hrmsnewgen.linde.com" ]
  }
}
```

### 3. `Program.cs`

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(p => p
        .WithOrigins(allowedOrigins)
        .WithHeaders("Authorization", "Content-Type")
        .AllowAnyMethod());
        // NOTE: do NOT call AllowCredentials() — we use bearer tokens, not cookies.
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 4. Controller usage

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequiredScope("access_as_user")]
public class LeaveController : ControllerBase
{
    [HttpGet("GetLeaveBalance")]
    public IActionResult GetLeaveBalance([FromQuery] string userid)
    {
        // Resolve identity from token claims (preferred over the userid query param).
        var upn = User.FindFirst("preferred_username")?.Value
                  ?? User.FindFirst(System.Security.Claims.ClaimTypes.Upn)?.Value;
        // TODO: map upn -> existing AD-username via SQL (GetUserByUpn(@upn))
        // and ensure it matches/overrides the incoming userid.
        return Ok(new { upn });
    }
}
```

---

## Option B — ASP.NET Framework 4.x (OWIN)

### 1. NuGet

```
Microsoft.Owin                              (>= 4.x)
Microsoft.Owin.Host.SystemWeb
Microsoft.Owin.Security
Microsoft.Owin.Security.Jwt
Microsoft.Owin.Security.OAuth
Microsoft.IdentityModel.Protocols.OpenIdConnect
System.IdentityModel.Tokens.Jwt
Microsoft.Owin.Cors
```

### 2. `web.config` — `<appSettings>`

```xml
<add key="ida:Tenant"   value="1562f007-09a4-4fcb-936b-e79246571fc7" />
<add key="ida:Audience" value="api://<API-CLIENT-ID>" />
<add key="ida:Issuer"   value="https://login.microsoftonline.com/1562f007-09a4-4fcb-936b-e79246571fc7/v2.0" />
```

### 3. `App_Start/Startup.Auth.cs`

```csharp
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security.Jwt;
using Owin;

[assembly: OwinStartup(typeof(HrmsApi.Startup))]

namespace HrmsApi
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // CORS — bearer flow, no credentials.
            app.UseCors(new CorsOptions
            {
                PolicyProvider = new CorsPolicyProvider
                {
                    PolicyResolver = ctx =>
                    {
                        var policy = new System.Web.Cors.CorsPolicy
                        {
                            AllowAnyMethod = true,
                            SupportsCredentials = false
                        };
                        policy.Origins.Add("https://test.hrmsnewgen.linde.com");
                        policy.Headers.Add("Authorization");
                        policy.Headers.Add("Content-Type");
                        return Task.FromResult(policy);
                    }
                }
            });

            ConfigureAuth(app);
        }

        public void ConfigureAuth(IAppBuilder app)
        {
            var tenant   = ConfigurationManager.AppSettings["ida:Tenant"];
            var audience = ConfigurationManager.AppSettings["ida:Audience"];
            var issuer   = ConfigurationManager.AppSettings["ida:Issuer"];
            var metadataAddress = $"https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration";

            JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

            app.UseJwtBearerAuthentication(new JwtBearerAuthenticationOptions
            {
                AuthenticationMode = Microsoft.Owin.Security.AuthenticationMode.Active,
                TokenValidationParameters = new TokenValidationParameters
                {
                    ValidAudience = audience,
                    ValidIssuer   = issuer,
                    NameClaimType = "preferred_username"
                },
                ConfigurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                    metadataAddress, new OpenIdConnectConfigurationRetriever())
            });
        }
    }
}
```

### 4. Controller usage (Web API 2)

```csharp
using System.Security.Claims;
using System.Web.Http;

[Authorize]
[RoutePrefix("api/Leave")]
public class LeaveController : ApiController
{
    [HttpGet, Route("GetLeaveBalance")]
    public IHttpActionResult GetLeaveBalance(string userid)
    {
        var principal = (ClaimsPrincipal)User;
        var upn = principal.FindFirst("preferred_username")?.Value
                  ?? principal.FindFirst(ClaimTypes.Upn)?.Value;
        // TODO: map upn -> existing AD-username via SQL.
        return Ok(new { upn });
    }

    // For an action that only some scopes can call, validate scope manually:
    private bool HasScope(string scope)
    {
        var scopes = ((ClaimsPrincipal)User).FindFirst("scp")?.Value ?? "";
        return scopes.Split(' ').Contains(scope);
    }
}
```

### 5. Remove old Windows-Auth filters

- Delete any `[AuthorizeWindows]`-style filters or `WindowsPrincipal` checks.
- In IIS for the API site, set **Anonymous = Enabled, Windows = Disabled**.
- Remove `<authentication mode="Windows" />` and any `<authorization><deny users="?" /></authorization>` blocks from `web.config`.

---

## Identity mapping (UPN -> existing AD username)

The SPA used to rely on Windows Auth giving the API `DOMAIN\samAccountName`. After
the cutover the API receives a JWT whose stable per-user claim is `preferred_username`
(UPN, e.g. `firstname.lastname@linde.com`).

1. Add a column `UPN` (or reuse existing `Email`) on the employees table.
2. Backfill from AD once: `Get-ADUser -Filter * -Properties UserPrincipalName, sAMAccountName`
   and update each row.
3. Add a stored procedure:

```sql
CREATE OR ALTER PROCEDURE dbo.GetUserByUpn @UPN NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1 EmployeeID, ADUserName, FullName, RoleCode
    FROM   dbo.Employee
    WHERE  UPN = @UPN;
END
```

4. In a request-scoped helper (DI in .NET Core, OWIN middleware in Framework),
   call `GetUserByUpn(upn)` once and cache the result on `HttpContext.Items` so
   downstream code reads `ADUserName` instead of `User.Identity.Name`.

---

## API IIS hardening

- Bindings: HTTPS only; valid certificate.
- Authentication: Anonymous = Enabled, Windows = Disabled.
- Add response headers: HSTS, `X-Content-Type-Options: nosniff`.
- Reject HTTP-only callers via the URL Rewrite "Force HTTPS" rule (same as SPA `web.config`).
