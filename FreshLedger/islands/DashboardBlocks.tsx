import { useEffect, useState } from "preact/hooks";

interface Block {
  _id?: string;
  date: string;
  startOdometer: number;
  endOdometer: number;
  milesDriven?: number;
  earnings?: number;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch("/api/blocks", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as { blocks: Block[] };
      })
      .then((result) => {
        if (result) {
          setSignedIn(true);
          setBlocks(result.blocks);
        }
      })
      .catch(() => setSignedIn(false));
  }, []);

  const totalMiles = blocks.reduce(
    (total, block) =>
      total + (block.milesDriven ?? block.endOdometer - block.startOdometer),
    0,
  );
  const totalEarnings = blocks.reduce(
    (total, block) => total + (block.earnings ?? 0),
    0,
  );

  return (
    <>
      {blocks.length > 0 && (
        <div class="stats-grid">
          <div class="stat-card">
            <span>Miles driven</span>
            <strong>{totalMiles.toLocaleString()} mi</strong>
            <small>
              {blocks.length} delivery block{blocks.length === 1 ? "" : "s"}
            </small>
          </div>
          <div class="stat-card">
            <span>Earnings</span>
            <strong>${totalEarnings.toFixed(2)}</strong>
            <small>From your blocks</small>
          </div>
        </div>
      )}
      <div class="section-heading">
        <h2>Delivery blocks</h2>
        {signedIn && (
          <a class="section-action" href="/blocks/new">＋ Add Delivery Block</a>
        )}
      </div>
      {blocks.length > 0 && (
        <div class="block-list">
          {blocks.map((block) => {
            const miles = block.milesDriven ??
              block.endOdometer - block.startOdometer;
            return (
              <article class="block-card" key={block._id}>
                <div>
                  <strong>{formatDate(block.date)}</strong>
                  <span>{miles.toLocaleString()} total miles</span>
                </div>
                <div class="block-values">
                  <strong>${(block.earnings ?? 0).toFixed(2)}</strong>
                  <span>
                    {block.startOdometer.toLocaleString()} →{" "}
                    {block.endOdometer.toLocaleString()}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!signedIn && (
        <a class="secondary-button block-signin" href="/login">
          Sign in to view your delivery blocks
        </a>
      )}
    </>
  );
}
