namespace SmsWeb

open Ninject
open Ninject.Web.Mvc
open System
open System.Linq
open System.Net.Http
open System.Web
open System.Web.Http
open System.Web.Mvc
open System.Web.Routing
open System.Web.Optimization


type BundleConfig() =
    static member RegisterBundles (bundles:BundleCollection) =
        bundles.Add(ScriptBundle("~/bundles/jquery").Include([|"~/Scripts/Libraries/jquery-{version}.js"|]))

        // Use the development version of Modernizr to develop with and learn from. Then, when you're
        // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
        bundles.Add(ScriptBundle("~/bundles/modernizr").Include([|"~/Scripts/Libraries/modernizr-*"|]))

        bundles.Add(ScriptBundle("~/bundles/bootstrap").Include(
                        "~/Scripts/Libraries/bootstrap.js",
                        "~/Scripts/Libraries/respond.js"))

        bundles.Add(StyleBundle("~/Content/css").Include(
                        "~/Content/bootstrap.css",
                        "~/Content/site.css"))

/// Route for ASP.NET MVC applications
type Route = { 
    controller : string
    action : string
    id : UrlParameter }

type HttpRoute = {
    controller : string
    id : RouteParameter }

type WebAPILoader() =
    inherit System.Web.Http.Dispatcher.DefaultAssembliesResolver()
        member x.GetAssemblies() : System.Collections.ICollection = 

            let defaultAssemblies = base.GetAssemblies();
            let assemblies = new System.Collections.Generic.List<System.Reflection.Assembly>(defaultAssemblies);
            
            let t = typeof<SmsWeb.Controllers.HomeController>;
            let a = t.Assembly;
            defaultAssemblies.Add(a);
            assemblies :> System.Collections.ICollection;

type Global() =
    inherit System.Web.HttpApplication() 

    static member CreateResolver(kernel) : System.Web.Http.Dependencies.IDependencyResolver = 
        new NinjectResolver(kernel) :> System.Web.Http.Dependencies.IDependencyResolver

    static member RegisterWebApi(config: HttpConfiguration) =
        // Configure routing
        config.MapHttpAttributeRoutes()
        config.Routes.MapHttpRoute(
            "DefaultApi",
            "api/{controller}/{id}",
            { controller = "{controller}"; id = RouteParameter.Optional }
        ) |> ignore

        config.Services.Replace(typeof<System.Web.Http.Dispatcher.IAssembliesResolver>, WebAPILoader());

        // Configure serialization
        config.Formatters.XmlFormatter.UseXmlSerializer <- true
        config.Formatters.JsonFormatter.SerializerSettings.ContractResolver <- Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()

        let kernel = new StandardKernel();
        kernel.Bind<int>().ToConstant(123456) |> ignore
        kernel.Bind<SmsWeb.Services.IAuthenticationService>().To<SmsWeb.Services.AuthenticationService>() |> ignore
        config.DependencyResolver <- Global.CreateResolver kernel

    static member RegisterFilters(filters: GlobalFilterCollection) =
        filters.Add(new HandleErrorAttribute())

    static member RegisterRoutes(routes:RouteCollection) =
        routes.IgnoreRoute("{resource}.axd/{*pathInfo}")
        routes.MapRoute(
            "Default", // Route name
            "{controller}/{action}/{id}", // URL with parameters
            { controller = "Home"; action = "Index"; id = UrlParameter.Optional } // Parameter defaults
        ) |> ignore

    member x.Application_Start() =
        AreaRegistration.RegisterAllAreas()
        GlobalConfiguration.Configure(Action<_> Global.RegisterWebApi)
        Global.RegisterFilters(GlobalFilters.Filters)
        Global.RegisterRoutes(RouteTable.Routes)
        BundleConfig.RegisterBundles BundleTable.Bundles