import { Monogram } from "@/components/invite/monogram";

export default function InviteNotFound() {
  return (
    <div className="iv" data-theme="navy">
      <main className="iv-missing">
        <Monogram />
        <h1>لم نجد هذه الدعوة</h1>
        <p>تأكّدوا من الرابط كما وصلكم، أو اطلبوه من جديد من العائلة.</p>
      </main>
    </div>
  );
}
