interface SellSheetData {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  propertySpecs: {
    sqft: number;
    stories: string;
  };
  pricing: {
    aLaCarteTotal: number;
    annualPrice: number;
    monthlyPrice: number;
    savings: number;
    discountPercent: number;
  };
  quoteDate: string;
  sellSheetId: string;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateSellSheetHTML(data: SellSheetData): string {
  const { customerName, customerEmail, customerPhone, customerAddress, propertySpecs, pricing, quoteDate, sellSheetId } = data;

  const customerContactLines = [
    customerAddress ? `<p style="margin:4px 0;color:#64748b;font-size:15px;">${customerAddress}</p>` : "",
    customerEmail ? `<p style="margin:4px 0;color:#64748b;font-size:14px;">${customerEmail}</p>` : "",
    customerPhone ? `<p style="margin:4px 0;color:#64748b;font-size:14px;">${customerPhone}</p>` : "",
  ].filter(Boolean).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Clean365 – Quote for ${customerName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.5}
  .page{max-width:800px;margin:0 auto;background:#fff}

  .customer-header{padding:40px 48px 24px;border-bottom:1px solid #e2e8f0}
  .customer-header h2{font-size:22px;font-weight:700;color:#1e293b;margin-bottom:2px}
  .customer-header .quote-meta{display:flex;gap:24px;margin-top:8px;font-size:13px;color:#94a3b8}

  .brand-header{padding:32px 48px;text-align:center;background:linear-gradient(135deg,#1e3a5f 0%,#2d5a8e 100%);color:#fff}
  .brand-header h1{font-size:28px;font-weight:800;letter-spacing:0.5px}
  .brand-header p{font-size:15px;opacity:.85;margin-top:4px}

  .intro{padding:28px 48px;text-align:center;color:#475569;font-size:15px}

  .alacarte-bar{margin:0 48px 28px;padding:16px 24px;background:#f1f5f9;border-radius:8px;display:flex;justify-content:space-between;align-items:center}
  .alacarte-bar span{font-size:14px;color:#64748b}
  .alacarte-bar strong{font-size:18px;color:#1e293b}

  .plan-card{margin:0 48px 32px;border:2px solid #2563eb;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,.12)}
  .plan-card-header{padding:14px 24px;background:#1e3a5f;text-align:center;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff}
  .plan-card-body{padding:32px 24px;text-align:center}
  .plan-monthly{font-size:48px;font-weight:800;color:#1e3a5f}
  .plan-monthly span{font-size:18px;font-weight:400;color:#94a3b8}
  .plan-annual{margin-top:6px;font-size:16px;color:#64748b}
  .plan-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}
  .plan-stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px}
  .plan-stat-value{font-size:18px;font-weight:700;color:#1e293b}
  .plan-stat-label{font-size:12px;color:#94a3b8;margin-top:2px}
  .plan-savings{background:#f0fdf4;border-color:#bbf7d0}
  .plan-savings .plan-stat-value{color:#16a34a}

  .schedule{padding:0 48px 32px}
  .schedule h3{font-size:17px;font-weight:700;margin-bottom:14px;color:#1e293b}
  .schedule-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .quarter{border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-size:13px}
  .quarter h4{font-size:14px;font-weight:700;margin-bottom:6px;color:#1e3a5f}
  .quarter li{list-style:none;padding:2px 0;color:#475569}
  .quarter li::before{content:"✓ ";color:#16a34a;font-weight:700}

  .property-specs{margin:0 48px 28px;padding:16px 24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;display:flex;gap:32px;font-size:14px;color:#475569}
  .property-specs strong{color:#1e293b}

  .footer{padding:24px 48px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#94a3b8}

  @media print{
    body{background:#fff}
    .page{box-shadow:none}
  }
  @media(max-width:640px){
    .schedule-grid{grid-template-columns:repeat(2,1fr)}
    .customer-header,.brand-header,.intro,.schedule,.footer{padding-left:24px;padding-right:24px}
    .alacarte-bar,.property-specs,.plan-card{margin-left:24px;margin-right:24px}
  }
</style>
</head>
<body>
<div class="page">

  <!-- Customer Header -->
  <div class="customer-header">
    <h2>Prepared for: ${customerName}</h2>
    ${customerContactLines}
    <div class="quote-meta">
      <span>Quote Date: ${quoteDate}</span>
      <span>Ref: ${sellSheetId}</span>
    </div>
  </div>

  <!-- Brand Header -->
  <div class="brand-header">
    <h1>Clean365 Annual Maintenance Plan</h1>
    <p>Comprehensive property care — one simple monthly payment</p>
  </div>

  <!-- Intro -->
  <div class="intro">
    <p>Your home receives <strong>26 professional services</strong> throughout the year — gutters, house wash, roof treatment, dryer vent, and more — bundled at <strong>${pricing.discountPercent}% off</strong> individual pricing.</p>
  </div>

  <!-- A La Carte Total -->
  <div class="alacarte-bar">
    <span>Individual Service Value (à la carte)</span>
    <strong>$${fmt(pricing.aLaCarteTotal)}</strong>
  </div>

  <!-- Single Plan Card -->
  <div class="plan-card">
    <div class="plan-card-header">Clean365 Annual Plan</div>
    <div class="plan-card-body">
      <div class="plan-monthly">$${fmt(pricing.monthlyPrice)}<span>/mo</span></div>
      <div class="plan-annual">Billed annually at $${fmt(pricing.annualPrice)}</div>
      <div class="plan-stats">
        <div class="plan-stat">
          <div class="plan-stat-value">$${fmt(pricing.aLaCarteTotal)}</div>
          <div class="plan-stat-label">À La Carte Value</div>
        </div>
        <div class="plan-stat">
          <div class="plan-stat-value">$${fmt(pricing.annualPrice)}</div>
          <div class="plan-stat-label">Annual Total</div>
        </div>
        <div class="plan-stat plan-savings">
          <div class="plan-stat-value">$${fmt(pricing.savings)}</div>
          <div class="plan-stat-label">You Save (${pricing.discountPercent}%)</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Property Specs -->
  <div class="property-specs">
    <div><strong>Property Size:</strong> ${propertySpecs.sqft.toLocaleString()} sq ft</div>
    <div><strong>Stories:</strong> ${propertySpecs.stories}</div>
  </div>

  <!-- Quarterly Schedule -->
  <div class="schedule">
    <h3>Your Quarterly Service Schedule</h3>
    <div class="schedule-grid">
      <div class="quarter">
        <h4>Q1 · Winter</h4>
        <ul>
          <li>Gutter Cleaning</li>
          <li>Dryer Vent Cleaning</li>
          <li>Interior High Dusting</li>
          <li>Garbage Can Cleaning</li>
          <li>Window Cleaning</li>
        </ul>
      </div>
      <div class="quarter">
        <h4>Q2 · Spring</h4>
        <ul>
          <li>Gutter Cleaning</li>
          <li>House Washing</li>
          <li>Gutter Brightening</li>
          <li>Deck/Patio Power Wash</li>
          <li>Weed Removal</li>
          <li>Garbage Can Cleaning</li>
        </ul>
      </div>
      <div class="quarter">
        <h4>Q3 · Summer</h4>
        <ul>
          <li>Gutter Cleaning</li>
          <li>Roof Cleaning</li>
          <li>Driveway Power Wash</li>
          <li>Weed Removal</li>
          <li>Outdoor Upholstery</li>
          <li>Garbage Can Cleaning</li>
        </ul>
      </div>
      <div class="quarter">
        <h4>Q4 · Fall</h4>
        <ul>
          <li>Gutter Cleaning</li>
          <li>Window Cleaning</li>
          <li>Furniture Shrink Wrap</li>
          <li>Garbage Can Cleaning</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Quote Date: ${quoteDate}</span>
    <span>${sellSheetId}</span>
  </div>

</div>
</body>
</html>`;
}
