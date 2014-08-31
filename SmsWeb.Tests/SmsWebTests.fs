namespace SmsWeb.Tests

open NUnit.Framework

[<TestFixture>]
type SmsWebTests() =

    [<Test>]
    let ``When 1 add 1``() =
        Assert.That(2, Is.EqualTo 2)