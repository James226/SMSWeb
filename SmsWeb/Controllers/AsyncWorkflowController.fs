namespace SmsWeb.Controllers

open System
open System.Web.Mvc
open System.Web.Mvc.Async
open System.Runtime.ExceptionServices
open Newtonsoft.Json

open Unchecked

type AsyncWorkflowController() = 
    inherit AsyncController()

    override __.CreateActionInvoker() = 
        upcast { new AsyncControllerActionInvoker() with

                member __.GetControllerDescriptor(controllerContext) =
                    let controllerType = controllerContext.Controller.GetType()

                    upcast { new ReflectedAsyncControllerDescriptor(controllerType) with 
                            member ctrlDesc.FindAction(controllerContext, actionName) =
                                let forwarder = base.FindAction(controllerContext, actionName) :?> ReflectedActionDescriptor

                                if(forwarder = null || forwarder.MethodInfo.ReturnType <> typeof<Async<ActionResult>>) then
                                    upcast forwarder
                                else 
                                let endAsync' = ref (defaultof<IAsyncResult -> Choice<ActionResult, exn>>)

                                upcast { new AsyncActionDescriptor() with

                                        member actionDesc.ActionName = forwarder.ActionName
                                        member actionDesc.ControllerDescriptor = upcast ctrlDesc
                                        member actionDesc.GetParameters() = forwarder.GetParameters()

                                        member actionDesc.BeginExecute(controllerContext, parameters, callback, state) =
                                            let asyncWorkflow = 
                                                forwarder.Execute(controllerContext, parameters) :?> Async<ActionResult>
                                                |> Async.Catch
                                            let beginAsync, endAsync, _ = Async.AsBeginEnd(fun () -> asyncWorkflow)
                                            endAsync' := endAsync
                                            beginAsync((), callback, state)

                                        member actionDesc.EndExecute(asyncResult) =
                                            match endAsync'.Value(asyncResult) with
                                                | Choice1Of2 value -> box value
                                                | Choice2Of2 why -> 
                                                    // Preserve the stack trace, when rethrow 
                                                    ExceptionDispatchInfo.Capture(why).Throw() 
                                                    obj() (* Satisfy return value *) } } }

    member x.Json(obj) =
        JsonConvert.SerializeObject(obj)