namespace SmsWeb.Models

open System.Xml.Serialization

[<CLIMutable>]
type SendMessage = {
    AccountReference: string
    From: string
    To: string
    Body: string
}
