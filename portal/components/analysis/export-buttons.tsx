"use client";

// 导出按钮：CSV（Blob 纯前端）与 PDF（jspdf，动态加载避免进入首屏 bundle）
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export";
import type { DatasetProperty } from "@/lib/types";

const HEADERS = [
  "id",
  "square_footage",
  "bedrooms",
  "bathrooms",
  "year_built",
  "lot_size",
  "distance_to_city_center",
  "school_rating",
  "price",
] as const;

function toRows(properties: DatasetProperty[]): Array<Array<string | number>> {
  return properties.map((p) => HEADERS.map((h) => p[h]));
}

export function ExportButtons({ properties }: { properties: DatasetProperty[] }) {
  const [exporting, setExporting] = useState(false);

  function exportCsv() {
    downloadCsv("properties.csv", [...HEADERS], toRows(properties));
  }

  async function exportPdf() {
    setExporting(true);
    try {
      // 动态导入：jspdf 体积较大，仅在用户点击时加载
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      doc.text("Property market data", 14, 16);
      doc.setFontSize(9);
      doc.text(
        `${properties.length} listings · exported from Property Portal`,
        14,
        22,
      );
      autoTable(doc, {
        head: [[...HEADERS]],
        body: toRows(properties).map((row) => row.map(String)),
        startY: 26,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [79, 70, 229] },
      });
      doc.save("properties.pdf");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={exportCsv}>
        Export CSV
      </Button>
      <Button variant="secondary" onClick={exportPdf} disabled={exporting}>
        {exporting ? "Exporting…" : "Export PDF"}
      </Button>
    </div>
  );
}
