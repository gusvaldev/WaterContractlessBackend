import PDFDocument from "pdfkit";
import { Subdivision, Street, House, Report } from "../models";

const COLORS = {
  primary: "#1e40af",
  secondary: "#64748b",
  success: "#10b981",
  danger: "#ef4444",
  light: "#f1f5f9",
  text: "#1e293b",
  textLight: "#64748b",
};

const drawHeader = (doc: PDFKit.PDFDocument, subdivisionName?: string) => {
  doc.fillColor("#ffffff").rect(0, 0, doc.page.width, 120).fill(COLORS.primary);

  doc
    .fillColor("#ffffff")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("JAPAMA - Sistema de Gestión de Agua", 50, 30, { align: "center" });

  doc
    .fontSize(16)
    .font("Helvetica")
    .text("Reporte de Tomas Directas", 50, 60, { align: "center" });

  if (subdivisionName) {
    doc.fontSize(12).text(`Fraccionamiento: ${subdivisionName}`, 50, 85, {
      align: "center",
    });
  }

  doc.fillColor(COLORS.text);
};

const drawInfoBox = (
  doc: PDFKit.PDFDocument,
  y: number,
  label: string,
  value: string
) => {
  doc.fontSize(9).fillColor(COLORS.textLight).text(label, 50, y);
  doc.fontSize(10).fillColor(COLORS.text).text(value, 150, y);
};

const drawSectionHeader = (doc: PDFKit.PDFDocument, title: string) => {
  const y = doc.y;
  doc
    .fillColor(COLORS.light)
    .rect(40, y - 5, doc.page.width - 80, 25)
    .fill();

  doc
    .fillColor(COLORS.primary)
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(title, 50, y, { width: doc.page.width - 100 });

  doc.moveDown(0.8);
};

const drawHouseCard = (doc: PDFKit.PDFDocument, house: any) => {
  const reportCount = house.reports?.length || 0;
  const baseHeight = reportCount > 0 ? 70 : 55;
  const cardHeight = baseHeight + reportCount * 15;

  if (doc.y + cardHeight > doc.page.height - 70) {
    doc.addPage();
    drawHeader(doc);
    doc.moveDown(8);
  }

  const y = doc.y;

  doc
    .fillColor("#ffffff")
    .rect(50, y, doc.page.width - 100, cardHeight)
    .fill()
    .strokeColor(COLORS.light)
    .lineWidth(1)
    .rect(50, y, doc.page.width - 100, cardHeight)
    .stroke();

  doc
    .fillColor(COLORS.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`Casa #${house.house_number}`, 60, y + 10);

  const statusY = y + 32;
  const inhabitedIcon = house.inhabited === "1" ? "[Si]" : "[No]";
  const inhabitedColor =
    house.inhabited === "1" ? COLORS.success : COLORS.danger;
  const waterIcon = house.water === "1" ? "[Si]" : "[No]";
  const waterColor = house.water === "1" ? COLORS.success : COLORS.danger;

  doc.fontSize(9).fillColor(COLORS.textLight).text("Estado:", 60, statusY);

  doc
    .fillColor(inhabitedColor)
    .font("Helvetica-Bold")
    .text(inhabitedIcon, 110, statusY)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(house.inhabited === "1" ? "Habitada" : "Deshabitada", 135, statusY);

  doc
    .fillColor(waterColor)
    .font("Helvetica-Bold")
    .text(waterIcon, 250, statusY)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(house.water === "1" ? "Con agua" : "Sin agua", 275, statusY);

  if (house.reports && house.reports.length > 0) {
    doc
      .fontSize(9)
      .fillColor(COLORS.textLight)
      .font("Helvetica-Bold")
      .text("Historial de Reportes:", 60, statusY + 22);

    house.reports.forEach((report: any, index: number) => {
      const reportY = statusY + 37 + index * 15;
      const fecha = new Date(report.report_date).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      doc
        .fillColor(COLORS.secondary)
        .fontSize(8)
        .font("Helvetica")
        .text("-", 70, reportY)
        .fillColor(COLORS.primary)
        .font("Helvetica-Bold")
        .text(fecha, 80, reportY)
        .fillColor(COLORS.text)
        .font("Helvetica")
        .text(report.comments || "Sin comentarios", 140, reportY, {
          width: doc.page.width - 180,
        });
    });
  } else {
    doc
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .font("Helvetica-Oblique")
      .text("", 60, statusY + 22);
  }

  doc.y = y + cardHeight + 8;
};

export const generateSubdivisionPDF = async (subdivisionId: number) => {
  const subdivision = await Subdivision.findByPk(subdivisionId, {
    include: [
      {
        model: Street,
        as: "streets",
        include: [
          {
            model: House,
            as: "houses",
            include: [
              {
                model: Report,
                as: "reports",
                order: [["report_date", "DESC"]],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!subdivision) {
    throw new Error("Subdivision not found");
  }

  const subdivisionData = subdivision.toJSON() as any;
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });

  drawHeader(doc, subdivisionData.subdivision_name);
  doc.moveDown(7);

  drawInfoBox(
    doc,
    doc.y,
    "Fecha de emisión:",
    new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  doc.moveDown();

  const totalCasas = subdivisionData.streets.reduce(
    (sum: number, s: any) => sum + s.houses.length,
    0
  );
  const casasHabitadas = subdivisionData.streets.reduce(
    (sum: number, s: any) =>
      sum + s.houses.filter((h: any) => h.inhabited === "1").length,
    0
  );
  const casasConAgua = subdivisionData.streets.reduce(
    (sum: number, s: any) =>
      sum + s.houses.filter((h: any) => h.water === "1").length,
    0
  );

  drawInfoBox(doc, doc.y, "Total de casas:", totalCasas.toString());
  doc.moveDown(0.5);
  drawInfoBox(
    doc,
    doc.y,
    "Casas habitadas:",
    `${casasHabitadas} (${Math.round((casasHabitadas / totalCasas) * 100)}%)`
  );
  doc.moveDown(0.5);
  drawInfoBox(
    doc,
    doc.y,
    "Casas con agua:",
    `${casasConAgua} (${Math.round((casasConAgua / totalCasas) * 100)}%)`
  );
  doc.moveDown(2);

  subdivisionData.streets.forEach((street: any, index: number) => {
    if (index > 0) {
      doc.moveDown(1.5);
    }

    drawSectionHeader(doc, `Calle: ${street.street_name}`);

    if (street.houses.length === 0) {
      doc
        .fontSize(10)
        .fillColor(COLORS.textLight)
        .font("Helvetica-Oblique")
        .text("Sin casas registradas en esta calle", 60, doc.y);
      doc.moveDown();
      return;
    }

    street.houses.forEach((house: any) => {
      drawHouseCard(doc, house);
    });
  });

  doc.on("pageAdded", () => {
    const pageCount = (doc as any).pageCount || 1;
    doc
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .text(`Página ${pageCount}`, 50, doc.page.height - 50, {
        align: "center",
      });
  });

  return doc;
};

export const generateAllSubdivisionsPDF = async () => {
  const subdivisions = await Subdivision.findAll({
    include: [
      {
        model: Street,
        as: "streets",
        include: [
          {
            model: House,
            as: "houses",
            include: [
              {
                model: Report,
                as: "reports",
                order: [["report_date", "DESC"]],
              },
            ],
          },
        ],
      },
    ],
  });

  if (subdivisions.length === 0) {
    throw new Error("No subdivisions found");
  }

  const subdivisionsData = subdivisions.map((s) => s.toJSON()) as any[];
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });

  drawHeader(doc);
  doc.moveDown(7);

  drawInfoBox(
    doc,
    doc.y,
    "Fecha de emisión:",
    new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  doc.moveDown();

  const totalFraccionamientos = subdivisionsData.length;
  const totalCasas = subdivisionsData.reduce(
    (sum: number, s: any) =>
      sum +
      s.streets.reduce(
        (streetSum: number, st: any) => streetSum + st.houses.length,
        0
      ),
    0
  );
  const casasHabitadas = subdivisionsData.reduce(
    (sum: number, s: any) =>
      sum +
      s.streets.reduce(
        (streetSum: number, st: any) =>
          streetSum + st.houses.filter((h: any) => h.inhabited === "1").length,
        0
      ),
    0
  );
  const casasConAgua = subdivisionsData.reduce(
    (sum: number, s: any) =>
      sum +
      s.streets.reduce(
        (streetSum: number, st: any) =>
          streetSum + st.houses.filter((h: any) => h.water === "1").length,
        0
      ),
    0
  );

  drawInfoBox(
    doc,
    doc.y,
    "Total de fraccionamientos:",
    totalFraccionamientos.toString()
  );
  doc.moveDown(0.5);
  drawInfoBox(doc, doc.y, "Total de casas:", totalCasas.toString());
  doc.moveDown(0.5);
  drawInfoBox(
    doc,
    doc.y,
    "Casas habitadas:",
    `${casasHabitadas} (${Math.round((casasHabitadas / totalCasas) * 100)}%)`
  );
  doc.moveDown(0.5);
  drawInfoBox(
    doc,
    doc.y,
    "Casas con agua:",
    `${casasConAgua} (${Math.round((casasConAgua / totalCasas) * 100)}%)`
  );
  doc.moveDown(2);

  subdivisionsData.forEach((subdivision: any, subdivIndex: number) => {
    if (subdivIndex > 0) {
      doc.addPage();
      drawHeader(doc, subdivision.subdivision_name);
      doc.moveDown(7);
    } else {
      doc.moveDown(1);
      doc
        .fillColor(COLORS.primary)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(`>> ${subdivision.subdivision_name}`, { align: "center" });
      doc.moveDown(1);
    }

    if (subdivIndex > 0) {
      const casas = subdivision.streets.reduce(
        (sum: number, st: any) => sum + st.houses.length,
        0
      );
      const habitadas = subdivision.streets.reduce(
        (sum: number, st: any) =>
          sum + st.houses.filter((h: any) => h.inhabited === "1").length,
        0
      );
      const conAgua = subdivision.streets.reduce(
        (sum: number, st: any) =>
          sum + st.houses.filter((h: any) => h.water === "1").length,
        0
      );

      drawInfoBox(doc, doc.y, "Total de casas:", casas.toString());
      doc.moveDown(0.5);
      drawInfoBox(
        doc,
        doc.y,
        "Casas habitadas:",
        `${habitadas} (${Math.round((habitadas / casas) * 100)}%)`
      );
      doc.moveDown(0.5);
      drawInfoBox(
        doc,
        doc.y,
        "Casas con agua:",
        `${conAgua} (${Math.round((conAgua / casas) * 100)}%)`
      );
      doc.moveDown(2);
    }

    subdivision.streets.forEach((street: any, index: number) => {
      if (index > 0) {
        doc.moveDown(1.5);
      }

      drawSectionHeader(doc, `Calle: ${street.street_name}`);

      if (street.houses.length === 0) {
        doc
          .fontSize(10)
          .fillColor(COLORS.textLight)
          .font("Helvetica-Oblique")
          .text("Sin casas registradas en esta calle", 60, doc.y);
        doc.moveDown();
        return;
      }

      street.houses.forEach((house: any) => {
        drawHouseCard(doc, house);
      });
    });
  });

  doc.on("pageAdded", () => {
    const pageCount = (doc as any).pageCount || 1;
    doc
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .text(`Página ${pageCount}`, 50, doc.page.height - 50, {
        align: "center",
      });
  });

  return doc;
};
