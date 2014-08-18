namespace SmsWeb

open System;
open System.Web;
open Microsoft.Web.Infrastructure.DynamicModuleHelper;
open Ninject;
open Ninject.Web.Common;

type NinjectWebCommon() =
    static member bootstrapper = new Bootstrapper();

    /// <summary>
    /// Starts the application
    /// </summary>
    static member Start() =
        DynamicModuleUtility.RegisterModule(typeof<OnePerRequestHttpModule>)
        DynamicModuleUtility.RegisterModule(typeof<NinjectHttpModule>)
        NinjectWebCommon.bootstrapper.Initialize(fun () -> NinjectWebCommon.CreateKernel());
        
    /// <summary>
    /// Stops the application.
    /// </summary>
    static member Stop() =
        NinjectWebCommon.bootstrapper.ShutDown();       

    /// <summary>
    /// Creates the kernel that will manage your application.
    /// </summary>
    /// <returns>The created kernel.</returns>
    static member CreateKernel() : IKernel =
        let kernel = new StandardKernel()
        kernel.Bind<Func<IKernel>>().ToMethod((fun ctx -> Func<IKernel>(fun () -> 
            let bs = new Bootstrapper()
            bs.Kernel))) |> ignore
        kernel.Bind<IHttpModule>().To<HttpApplicationInitializationHttpModule>() |> ignore

        NinjectWebCommon.RegisterServices(kernel)
        kernel :> IKernel

    /// <summary>
    /// Load your modules or register your services here!
    /// </summary>
    /// <param name="kernel">The kernel.</param>
    static member RegisterServices(kernel: IKernel) =
        System.Web.Http.GlobalConfiguration.Configuration.DependencyResolver <- new NinjectResolver(kernel)

        kernel.Bind<int>().ToConstant(543) |> ignore

module AssemblyAttributes =
    [<assembly: WebActivatorEx.PreApplicationStartMethod(typeof<NinjectWebCommon>, "Start")>]
    [<assembly: WebActivatorEx.ApplicationShutdownMethodAttribute(typedefof<NinjectWebCommon>, "Stop")>]
    do()