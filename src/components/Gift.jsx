import { weddingConfig } from '../config/wedding'

function GiftDivider() {
  return <div className="gift__divider" aria-hidden="true" />
}

export default function Gift() {
  const { gift } = weddingConfig

  return (
    <section className="section gift">
      <div className="gift__card">
        <GiftDivider />
        <h2 className="gift__heading">Bank Details</h2>
        <GiftDivider />
        <p className="gift__bank-name">{gift.bankName}</p>
        <p className="gift__account">
          {gift.accountNumber} ({gift.currency})
        </p>
      </div>
    </section>
  )
}
