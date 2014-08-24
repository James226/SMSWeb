namespace SmsWeb.Services

open SmsWeb.Models
open System.Linq
open FSharp.Data
open FSharp.Data.HttpRequestHeaders
open System.Web.Security
open System.Web
open System.Web.Security

type IAuthenticationService =
    abstract member Authenticate : LoginCredentials -> Async<bool>
    abstract member GetCredentials : unit -> LoginCredentials
    abstract member Logout : unit -> unit

type AuthenticationService() =
    let mutable loggedInUsers : LoginCredentials list = []

    let GetBasicHeader(loginDetails) = 
        sprintf "%s:%s" loginDetails.Username loginDetails.Password
        |> System.Text.ASCIIEncoding.ASCII.GetBytes
        |> System.Convert.ToBase64String
        |> (fun s -> "Basic " + s)
 
    let credentialsCache = CredentialsCache()

    interface IAuthenticationService with
        member x.Authenticate(credentials: LoginCredentials) = async {
            try
                let auth = GetBasicHeader credentials
                let! html = Http.AsyncRequestString("http://api.dev.esendex.com/v1.0/accounts", headers = [ Authorization auth ])
                loggedInUsers <- credentials :: loggedInUsers
                credentialsCache.Store(credentials)
                FormsAuthentication.SetAuthCookie(credentials.Username, false);
                return true
            with
            | :? System.Net.WebException -> return false
        }

        member x.GetCredentials() =
            credentialsCache.Retrieve(HttpContext.Current.User.Identity.Name)

        member x.Logout() =
            let username = HttpContext.Current.User.Identity.Name
            credentialsCache.Forget(username)
            FormsAuthentication.SignOut()