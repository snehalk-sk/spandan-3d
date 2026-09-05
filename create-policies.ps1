$Business = "Spandan 3D"
$Location = "Maharashtra, India"
$Phone = "+91 9766979232"
$WhatsApp = "https://wa.me/919766979232"
$Instagram = "https://www.instagram.com/3D_spandan/"
$Updated = "5 September 2026"

function Create-Policy {
    param(
        [string]$FileName,
        [string]$Title,
        [string]$Intro,
        [string]$Content
    )

    $Header = @'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
'@

    $Header += "<title>$Title | $Business</title>"

    $Header += @'
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">

<style>
*{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

:root{
    --ink:#010d1a;
    --muted:#66717b;
    --cream:#fffdf8;
    --soft:#f5f1e8;
    --line:#e8e2d8;
}

body{
    font-family:"DM Sans",sans-serif;
    color:var(--ink);
    background:var(--cream);
    line-height:1.75;
}

a{
    color:inherit;
    text-decoration:none;
}

.container{
    width:min(1120px,calc(100% - 40px));
    margin:auto;
}

.topbar{
    background:var(--ink);
    color:white;
    padding:9px 20px;
    text-align:center;
    font-size:13px;
}

header{
    background:#fffdf8;
    border-bottom:1px solid var(--line);
}

.nav{
    min-height:76px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:30px;
}

.brand{
    font-family:"Manrope",sans-serif;
    font-size:22px;
    font-weight:800;
}

.nav-links{
    display:flex;
    align-items:center;
    gap:24px;
    font-size:14px;
    font-weight:600;
}

.nav-links a:hover{
    opacity:.6;
}

.hero{
    padding:80px 0 65px;
    text-align:center;
    border-bottom:1px solid var(--line);
    background:
        radial-gradient(circle at top,#f2ece0 0,transparent 48%),
        var(--cream);
}

.eyebrow{
    display:inline-block;
    margin-bottom:14px;
    color:var(--muted);
    font-size:12px;
    font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
}

h1{
    font-family:"Manrope",sans-serif;
    font-size:clamp(38px,6vw,62px);
    line-height:1.08;
    letter-spacing:-2px;
    margin-bottom:17px;
}

.hero p{
    max-width:700px;
    margin:auto;
    color:var(--muted);
}

.policy{
    max-width:850px;
    margin:auto;
    padding:65px 20px 85px;
}

.updated{
    padding:14px 18px;
    background:var(--soft);
    border:1px solid var(--line);
    border-radius:12px;
    color:var(--muted);
    font-size:14px;
    margin-bottom:40px;
}

.policy-section{
    margin-bottom:40px;
}

.policy-section h2{
    font-family:"Manrope",sans-serif;
    font-size:23px;
    letter-spacing:-.4px;
    margin-bottom:11px;
}

.policy-section p{
    color:#46515b;
    margin-bottom:12px;
}

.policy-section ul{
    margin:10px 0 14px 22px;
    color:#46515b;
}

.policy-section li{
    margin-bottom:8px;
}

.notice{
    padding:20px;
    background:var(--soft);
    border:1px solid var(--line);
    border-radius:14px;
    margin:18px 0;
    color:#46515b;
}

.contact{
    padding:24px;
    background:var(--soft);
    border:1px solid var(--line);
    border-radius:16px;
    margin-top:16px;
}

.contact a{
    font-weight:700;
    text-decoration:underline;
}

.policy-nav{
    border-top:1px solid var(--line);
    border-bottom:1px solid var(--line);
    padding:28px 0;
}

.policy-nav-inner{
    display:flex;
    flex-wrap:wrap;
    justify-content:center;
    gap:12px 24px;
    font-size:14px;
    font-weight:600;
}

footer{
    background:var(--ink);
    color:white;
    padding:52px 0 25px;
}

.footer-grid{
    display:grid;
    grid-template-columns:2fr 1fr 1fr;
    gap:50px;
    margin-bottom:40px;
}

.footer-brand{
    font-family:"Manrope",sans-serif;
    font-size:23px;
    font-weight:800;
    margin-bottom:10px;
}

.footer-copy{
    max-width:390px;
    color:#aeb7bf;
    font-size:14px;
}

footer h3{
    font-size:14px;
    margin-bottom:14px;
}

footer ul{
    list-style:none;
}

footer li{
    margin-bottom:8px;
}

footer li a{
    font-size:14px;
    color:#aeb7bf;
}

footer li a:hover{
    color:white;
}

.copyright{
    border-top:1px solid rgba(255,255,255,.12);
    padding-top:22px;
    text-align:center;
    color:#8e9aa4;
    font-size:13px;
}

@media(max-width:760px){

    .nav{
        min-height:68px;
    }

    .nav-links{
        gap:12px;
        font-size:12px;
    }

    .hide-mobile{
        display:none;
    }

    .hero{
        padding:55px 0 48px;
    }

    .policy{
        padding-top:48px;
    }

    .footer-grid{
        grid-template-columns:1fr;
        gap:28px;
    }
}
</style>
</head>
<body>

<div class="topbar">
Custom 3D printing available &middot; Made in India &middot; WhatsApp support
</div>
'@

    $Header += @"
<header>
<div class="container nav">

<a href="index.html" class="brand">SPANDAN 3D</a>

<nav class="nav-links">
<a href="shop.html">Shop</a>
<a href="custom-print.html">Custom Print</a>
<a href="about.html" class="hide-mobile">About</a>
<a href="contact.html" class="hide-mobile">Contact</a>
</nav>

</div>
</header>

<main>

<section class="hero">
<div class="container">
<span class="eyebrow">SPANDAN 3D &middot; POLICIES</span>
<h1>$Title</h1>
<p>$Intro</p>
</div>
</section>

<article class="policy">

<div class="updated">
Last updated: $Updated
</div>

$Content
"@

    $Footer = @"
<section class="policy-section">

<h2>Contact Spandan 3D</h2>

<p>
If you have any questions about this policy, an order, or a custom
3D printing request, please contact us.
</p>

<div class="contact">

<strong>Spandan 3D</strong><br>
$Location

<br><br>

<strong>WhatsApp:</strong><br>

<a href="$WhatsApp" target="_blank" rel="noopener">
$Phone
</a>

<br><br>

<strong>Instagram:</strong><br>

<a href="$Instagram" target="_blank" rel="noopener">
@3D_spandan
</a>

</div>

</section>

</article>

<section class="policy-nav">

<div class="container policy-nav-inner">

<a href="privacy-policy.html">Privacy Policy</a>

<a href="shipping-policy.html">Shipping Policy</a>

<a href="refund-policy.html">Cancellation &amp; Refund</a>

<a href="return-policy.html">Returns &amp; Replacement</a>

<a href="terms.html">Terms &amp; Conditions</a>

</div>

</section>

</main>

<footer>

<div class="container">

<div class="footer-grid">

<div>

<div class="footer-brand">
SPANDAN 3D
</div>

<p class="footer-copy">
3D printed products and custom 3D printing made in Maharashtra, India.
</p>

</div>

<div>

<h3>Shop</h3>

<ul>
<li><a href="shop.html">All Products</a></li>
<li><a href="new-designs.html">New Designs</a></li>
<li><a href="best-sellers.html">Best Sellers</a></li>
<li><a href="custom-print.html">Custom Print</a></li>
</ul>

</div>

<div>

<h3>Policies</h3>

<ul>
<li><a href="privacy-policy.html">Privacy Policy</a></li>
<li><a href="shipping-policy.html">Shipping Policy</a></li>
<li><a href="refund-policy.html">Cancellation &amp; Refund</a></li>
<li><a href="return-policy.html">Returns &amp; Replacement</a></li>
<li><a href="terms.html">Terms &amp; Conditions</a></li>
</ul>

</div>

</div>

<div class="copyright">
&copy; 2026 Spandan 3D. All rights reserved.
</div>

</div>

</footer>

</body>
</html>
"@

    $Page = $Header + $Footer

    Set-Content -Path $FileName -Value $Page -Encoding UTF8

    Write-Host "Created: $FileName" -ForegroundColor Green
}


# ============================================================
# 1. PRIVACY POLICY
# ============================================================

$Privacy = @'
<section class="policy-section">

<h2>1. About Spandan 3D</h2>

<p>
Spandan 3D is a 3D printing business based in Maharashtra, India.
We provide ready-made 3D printed products as well as custom 3D
printing services.
</p>

</section>


<section class="policy-section">

<h2>2. Information We Collect</h2>

<p>
When you browse our website, contact us, place an order, or request
a custom print, we may receive information that you provide to us.
</p>

<ul>
<li>Your name.</li>
<li>Your phone number.</li>
<li>Your email address, when provided.</li>
<li>Your shipping and billing information.</li>
<li>Products and quantities ordered.</li>
<li>Payment and transaction-related information.</li>
<li>Custom printing requirements.</li>
<li>STL, 3MF or OBJ files you choose to submit.</li>
<li>Reference images and design information.</li>
<li>Dimensions, colour and material preferences.</li>
<li>Messages you send to Spandan 3D.</li>
</ul>

</section>


<section class="policy-section">

<h2>3. How We Use Your Information</h2>

<p>
We may use information you provide to:
</p>

<ul>
<li>Process and fulfil orders.</li>
<li>Review custom 3D printing requests.</li>
<li>Prepare custom-print quotations.</li>
<li>Contact you regarding an order or quotation.</li>
<li>Arrange shipping and delivery.</li>
<li>Provide customer support.</li>
<li>Maintain appropriate business and transaction records.</li>
<li>Operate and improve our website and services.</li>
<li>Prevent misuse, fraud or security problems.</li>
</ul>

<p>
Spandan 3D does not sell customer personal information to advertisers.
</p>

</section>


<section class="policy-section">

<h2>4. Custom Print Files and Reference Images</h2>

<p>
Customers may submit STL, 3MF and OBJ files, reference images,
dimensions, material preferences, colour preferences and other
instructions for custom 3D printing.
</p>

<p>
These files and details may be used to review the request, prepare
a quotation, communicate with the customer and fulfil the custom order.
</p>

<p>
Customers should only upload files and content that they are authorised
to use and should avoid including unnecessary confidential or sensitive
information.
</p>

</section>


<section class="policy-section">

<h2>5. Payments</h2>

<p>
Spandan 3D uses online payment methods for website orders when online
payment functionality is available.
</p>

<p>
Payments may be processed by a third-party payment provider. That
provider may process information required to complete the transaction
according to its own privacy and security practices.
</p>

<div class="notice">
Spandan 3D will never ask you to send your complete card details,
banking password, UPI PIN or OTP through WhatsApp, Instagram or
other informal communication channels.
</div>

</section>


<section class="policy-section">

<h2>6. Service Providers</h2>

<p>
We may use third-party service providers for website hosting,
databases, payment processing, communication, shipping or delivery.
Information may be processed by these providers where reasonably
necessary to provide their services.
</p>

</section>


<section class="policy-section">

<h2>7. Information Security</h2>

<p>
We take reasonable measures to protect information used to operate
our business and website. However, no internet transmission or
electronic storage system can be guaranteed to be completely secure.
</p>

</section>


<section class="policy-section">

<h2>8. Data Retention</h2>

<p>
Order information, customer-support information and custom-print
information may be retained for as long as reasonably necessary for
order fulfilment, record keeping, dispute resolution and applicable
business or legal requirements.
</p>

</section>


<section class="policy-section">

<h2>9. Your Requests</h2>

<p>
You may contact Spandan 3D regarding personal information you
previously provided and request an appropriate correction or deletion,
subject to information that may reasonably need to be retained for
business, transaction or legal purposes.
</p>

</section>


<section class="policy-section">

<h2>10. Third-Party Services</h2>

<p>
Our website may contain links to services such as WhatsApp, Instagram,
payment providers or delivery providers. Their own privacy policies
apply when you use those services.
</p>

</section>


<section class="policy-section">

<h2>11. Changes to This Privacy Policy</h2>

<p>
We may update this Privacy Policy when our website, services or
business practices change. The latest version will be published on
this page with an updated date.
</p>

</section>
'@

Create-Policy `
    -FileName "privacy-policy.html" `
    -Title "Privacy Policy" `
    -Intro "How Spandan 3D collects, uses and protects information provided by customers." `
    -Content $Privacy


# ============================================================
# 2. SHIPPING POLICY
# ============================================================

$Shipping = @'
<section class="policy-section">

<h2>1. Order Processing</h2>

<p>
Spandan 3D products are produced using 3D printing. Some products
may be printed only after an order is received.
</p>

<p>
Processing time can vary depending on the product, quantity, model
complexity, print duration, finishing requirements and current
production workload.
</p>

</section>


<section class="policy-section">

<h2>2. Custom Print Orders</h2>

<p>
Custom-print orders may require additional time for file review,
quotation, customer approval, printing and finishing.
</p>

<p>
An estimated production timeline may be communicated after the
custom-print requirements have been reviewed.
</p>

</section>


<section class="policy-section">

<h2>3. Shipping and Delivery Estimates</h2>

<p>
Delivery times may vary according to the delivery location, courier
provider, order type and other circumstances.
</p>

<p>
Any delivery date communicated by Spandan 3D should be treated as
an estimate unless specifically confirmed otherwise.
</p>

</section>


<section class="policy-section">

<h2>4. Shipping Charges</h2>

<p>
Applicable shipping or delivery charges will be displayed or
communicated to the customer before the order is completed whenever
possible.
</p>

</section>


<section class="policy-section">

<h2>5. Shipping Address</h2>

<p>
Customers are responsible for providing a complete and accurate
shipping address, PIN code and contact number.
</p>

<p>
If you notice an error in your address, contact Spandan 3D as soon
as possible. We cannot guarantee that an address can be changed after
the parcel has been dispatched.
</p>

</section>


<section class="policy-section">

<h2>6. Delivery Delays</h2>

<p>
Courier delays, weather conditions, transport disruptions, incorrect
addresses, unreachable recipients and other circumstances outside
our reasonable control may affect delivery.
</p>

</section>


<section class="policy-section">

<h2>7. Damaged Packages</h2>

<p>
If your parcel arrives visibly damaged, please keep the packaging and
take clear photographs or video of the outer package, shipping label,
internal packaging and affected product.
</p>

<p>
Contact Spandan 3D promptly so that the issue can be reviewed.
</p>

</section>


<section class="policy-section">

<h2>8. Failed or Returned Delivery</h2>

<p>
If a parcel cannot be delivered because an incorrect address was
provided, the recipient was unavailable, or the parcel is returned
by the delivery provider, additional delivery charges may be required
before another delivery attempt is arranged.
</p>

</section>
'@

Create-Policy `
    -FileName "shipping-policy.html" `
    -Title "Shipping Policy" `
    -Intro "Information about processing, shipping and delivery of Spandan 3D orders." `
    -Content $Shipping


# ============================================================
# 3. CANCELLATION & REFUND POLICY
# ============================================================

$Refund = @'
<section class="policy-section">

<h2>1. Order Cancellation</h2>

<p>
If you need to cancel an order, contact Spandan 3D as soon as
possible.
</p>

<p>
Because products may be printed specifically for an order,
cancellation may not be possible once printing, customization,
finishing, packing or dispatch has begun.
</p>

</section>


<section class="policy-section">

<h2>2. Custom and Personalized Orders</h2>

<p>
Custom 3D prints and personalized products are manufactured according
to customer-provided or customer-approved specifications.
</p>

<p>
Once a custom order has been approved and production has started,
it normally cannot be cancelled solely because the customer changes
their mind.
</p>

</section>


<section class="policy-section">

<h2>3. When a Refund May Be Considered</h2>

<p>
A refund may be considered in circumstances such as:
</p>

<ul>
<li>An eligible order is cancelled before production begins.</li>
<li>Spandan 3D is unable to fulfil an accepted order.</li>
<li>The wrong product is supplied.</li>
<li>A product arrives materially damaged and the issue is verified.</li>
<li>A refund is otherwise required under applicable consumer law.</li>
</ul>

</section>


<section class="policy-section">

<h2>4. Reporting an Order Problem</h2>

<p>
Please contact us as soon as reasonably possible after discovering
a problem.
</p>

<p>
Provide your order information and clear photographs or video of the
product, packaging and issue where relevant. This helps us determine
whether a replacement, refund, correction or another solution is
appropriate.
</p>

</section>


<section class="policy-section">

<h2>5. Refund Processing</h2>

<p>
Once a refund has been reviewed and approved, it will be processed
using an appropriate available payment method. The time required for
the amount to appear in your account can depend on your bank or
payment provider.
</p>

<div class="notice">
Spandan 3D will never ask for your UPI PIN, OTP or banking password
in order to issue a refund.
</div>

</section>


<section class="policy-section">

<h2>6. Shipping Charges</h2>

<p>
Whether original or return shipping charges are refundable will
depend on the reason for the cancellation, return or refund and the
circumstances of the order.
</p>

</section>
'@

Create-Policy `
    -FileName "refund-policy.html" `
    -Title "Cancellation & Refund Policy" `
    -Intro "Cancellation and refund information for Spandan 3D products and custom print orders." `
    -Content $Refund


# ============================================================
# 4. RETURNS & REPLACEMENT POLICY
# ============================================================

$Return = @'
<section class="policy-section">

<h2>1. Characteristics of 3D Printed Products</h2>

<p>
3D printed products are manufactured layer by layer. Minor layer
lines, seam lines, small support marks and slight variations in
surface finish or colour may occur as part of the 3D printing
process.
</p>

<p>
Normal characteristics of the manufacturing process are not
automatically considered product defects.
</p>

</section>


<section class="policy-section">

<h2>2. Custom and Personalized Products</h2>

<p>
Products manufactured specifically according to a customer's model,
file, dimensions, name, design, colour selection or other personalized
instructions are generally not suitable for return solely because
of a change of mind.
</p>

</section>


<section class="policy-section">

<h2>3. Damaged or Incorrect Products</h2>

<p>
If you receive a materially damaged product or a product that is
materially different from what you ordered, contact Spandan 3D
promptly.
</p>

<p>Please provide:</p>

<ul>
<li>Your order details.</li>
<li>Clear photographs or video of the product.</li>
<li>Photographs of the packaging where delivery damage is involved.</li>
<li>A short description of the problem.</li>
</ul>

</section>


<section class="policy-section">

<h2>4. Replacement Review</h2>

<p>
After reviewing the issue, Spandan 3D may offer an appropriate
solution. Depending on the circumstances, this may include a
replacement, correction, refund or another reasonable resolution.
</p>

</section>


<section class="policy-section">

<h2>5. Condition of Returned Products</h2>

<p>
If a physical return is required, the product should be kept in
substantially the condition in which it was received unless damage
prevents this.
</p>

<p>
Please retain the original packaging until the reported issue has
been resolved.
</p>

</section>


<section class="policy-section">

<h2>6. Customer-Provided Specifications</h2>

<p>
For custom printing, customers are responsible for checking the
design, dimensions, spelling and other specifications they provide
or approve before production.
</p>

<p>
If we identify an obvious concern before printing, we may contact
the customer for clarification.
</p>

</section>
'@

Create-Policy `
    -FileName "return-policy.html" `
    -Title "Returns & Replacement Policy" `
    -Intro "Return and replacement information for Spandan 3D products and custom 3D printing." `
    -Content $Return


# ============================================================
# 5. TERMS & CONDITIONS
# ============================================================

$Terms = @'
<section class="policy-section">

<h2>1. About These Terms</h2>

<p>
These Terms & Conditions apply to use of the Spandan 3D website and
orders placed for our products or custom 3D printing services.
</p>

<p>
By placing an order, customers agree to provide accurate information
and comply with the terms applicable to their order.
</p>

</section>


<section class="policy-section">

<h2>2. Products</h2>

<p>
We aim to describe and display products accurately. Because products
are physically 3D printed, minor differences in colour, surface
finish, layer appearance, seam placement or support marks may occur.
</p>

</section>


<section class="policy-section">

<h2>3. Pricing</h2>

<p>
Product prices and custom-print quotations may depend on material,
model size, print duration, quantity, support requirements, finishing,
shipping and other production factors.
</p>

<p>
For custom printing, a quotation may be provided after reviewing the
customer's files and requirements.
</p>

</section>


<section class="policy-section">

<h2>4. Payments</h2>

<p>
Spandan 3D uses online payment methods for website orders when online
payment functionality is available.
</p>

<p>
An order may remain pending until the applicable payment and order
confirmation process has been completed.
</p>

</section>


<section class="policy-section">

<h2>5. Custom 3D Printing</h2>

<p>
Customers may submit STL, 3MF and OBJ files, reference images,
dimensions, colours, materials and other printing instructions.
</p>

<p>
The feasibility and price of a custom print can depend on model
geometry, size, material, print duration, support requirements,
finishing and other technical considerations.
</p>

</section>


<section class="policy-section">

<h2>6. Rights to Customer-Provided Content</h2>

<p>
By submitting a design, 3D model, image, logo, character, artwork or
other content, the customer confirms that they have the necessary
rights or permission to use that content for the requested purpose.
</p>

<p>
Spandan 3D may decline a printing request where we reasonably believe
the request may violate applicable law, intellectual-property rights,
safety requirements or our business policies.
</p>

</section>


<section class="policy-section">

<h2>7. Dimensions and Functional Fit</h2>

<p>
Customers requesting custom prints are responsible for supplying
accurate dimensions and checking measurements before approving
production.
</p>

<p>
3D printed parts can have normal manufacturing tolerances. Customers
should tell us before ordering when a part requires a specific
functional fit or critical tolerance.
</p>

</section>


<section class="policy-section">

<h2>8. Product Use</h2>

<p>
Unless a product is specifically represented as suitable for a
particular technical, safety-critical, food-contact, medical or
high-temperature application, customers should not assume that it
is suitable for such use.
</p>

</section>


<section class="policy-section">

<h2>9. Orders</h2>

<p>
We may contact customers when clarification is required before
production.
</p>

<p>
Spandan 3D may decline or cancel an order that cannot reasonably be
fulfilled, contains an obvious technical pricing error, or presents
a legal, safety or technical concern.
</p>

</section>


<section class="policy-section">

<h2>10. Delivery</h2>

<p>
Shipping and delivery are also subject to our Shipping Policy.
Delivery estimates may be affected by courier services and
circumstances outside our reasonable control.
</p>

</section>


<section class="policy-section">

<h2>11. Cancellations, Returns and Refunds</h2>

<p>
Cancellations, returns, replacements and refunds are handled
according to the applicable Spandan 3D policy pages and applicable
consumer law.
</p>

</section>


<section class="policy-section">

<h2>12. Website Availability</h2>

<p>
We may update, maintain or temporarily interrupt parts of the website.
We do not guarantee uninterrupted availability of every website
feature.
</p>

</section>


<section class="policy-section">

<h2>13. Changes to These Terms</h2>

<p>
We may update these Terms & Conditions when our website, services or
business practices change. The latest version will be published on
this page.
</p>

</section>


<section class="policy-section">

<h2>14. Applicable Law</h2>

<p>
These terms are intended to operate subject to applicable laws and
consumer rights in India. Nothing in these terms is intended to
exclude rights that cannot lawfully be excluded.
</p>

</section>
'@

Create-Policy `
    -FileName "terms.html" `
    -Title "Terms & Conditions" `
    -Intro "Terms governing purchases, custom printing and use of the Spandan 3D website." `
    -Content $Terms


Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "ALL 5 SPANDAN 3D POLICIES CREATED" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "privacy-policy.html"
Write-Host "shipping-policy.html"
Write-Host "refund-policy.html"
Write-Host "return-policy.html"
Write-Host "terms.html"
Write-Host ""