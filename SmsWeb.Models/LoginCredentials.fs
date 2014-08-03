namespace SmsWeb.Models

[<CLIMutable>]
type LoginCredentials = {
    Username: string
    Password: string
}

type LoginResult = {
    Success: bool
}