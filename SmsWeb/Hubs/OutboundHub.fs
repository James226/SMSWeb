﻿namespace SmsWeb.Hubs

open Microsoft.FSharp.Collections
open EkonBenefits.FSharp.Dynamic
open Microsoft.AspNet.SignalR
open System.Web
open SmsWeb.Connections

type ConnectionMode =
    | REST = 0
    | SMPP = 1

[<Authorize>]
type OutboundHub(authService: SmsWeb.Services.IAuthenticationService) =
    inherit Hub()

    static let mutable connection : Map<string, IConnection> = Map.ofList([])

    let CreateSMPPConnection(connectionId, credentials, statusUpdate, client) =
        let smppConnection = new SmppConnection(connectionId, credentials, statusUpdate)

        smppConnection.MessageSent
        |> Observable.subscribe client?MessageSent |> ignore

        smppConnection.MessageDelivered
        |> Observable.subscribe client?MessageDelivered |> ignore

        smppConnection.MessageReceived
        |> Observable.subscribe client?MessageReceived |> ignore

        connection <- connection.Add((connectionId, smppConnection :> IConnection))

    let someIf pred option =
        match option with
        | None -> None
        | Some o -> if pred(o) then option else None

    override x.OnDisconnected(stopCalled) =
        if connection.ContainsKey x.Context.ConnectionId then
            connection.[x.Context.ConnectionId].Dispose();
            connection <- connection.Remove(x.Context.ConnectionId)
        base.OnDisconnected(stopCalled)

    member x.SetMode(mode: ConnectionMode) : unit =
        let credentials: SmsWeb.Models.LoginCredentials = authService.GetCredentials()
        match mode with
        | ConnectionMode.REST -> "" |> ignore
        | ConnectionMode.SMPP -> CreateSMPPConnection(x.Context.ConnectionId, credentials, x.UpdateStatus, x.Clients.Client(x.Context.ConnectionId))
        | _ -> "" |> ignore

    member x.UpdateStatus(connectionId: string, status) =
        x.Clients.Client(connectionId)?UpdateStatus(status)

    member x.SendMessage(originator, recipient, message) =
        let connection : IConnection option =
            Map.tryFind x.Context.ConnectionId connection
            |> someIf (fun c -> c.IsConnected())
        match connection with 
        | None -> Seq.singleton ("0", "Failed")
        | Some connection -> connection.SendMessage(originator, recipient, message)
