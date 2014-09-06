namespace SmsWeb.Tests

open NUnit.Framework

[<TestFixture>]
type SmsWebTests() =

    [<Test>]
    member x.``When 1 add 1``() =
        Assert.That(2, Is.EqualTo 2)