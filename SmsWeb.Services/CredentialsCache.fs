namespace SmsWeb.Services

open SmsWeb.Models
open System.Configuration
open ServiceStack.Common
open ServiceStack.Text 
open ServiceStack.Redis

type CredentialsCache() =
    let redis = new RedisClient(ConfigurationManager.AppSettings.["redis.host"], System.Int32.Parse(ConfigurationManager.AppSettings.["redis.port"]), ConfigurationManager.AppSettings.["redis.key"])
    let credentialsCache = redis.As<LoginCredentials>()

    member x.Store(credentials: LoginCredentials) =
        credentialsCache.SetEntry(credentials.Username, credentials)
        credentialsCache.ExpireIn(credentials.Username, System.TimeSpan.FromDays(7.0)) |> ignore

    member x.Retrieve(username: string) =
        credentialsCache.GetValue(username)

    member x.Forget(username: string) =
        credentialsCache.RemoveEntry(username) |> ignore