import ExcelJS from "exceljs";
import { Subdivision, Street, House, Report } from "../models";

const COLORS = {
  headerBg: "FF1e40af",
  headerText: "FFFFFFFF",
  successBg: "FF10b981",
  dangerBg: "FFef4444",
  lightGray: "FFf1f5f9",
  darkText: "FF1e293b",
};

export const generateSubdivisionExcel = async (subdivisionId: number) => {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "JAPAMA";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Reporte de Tomas Directas");

  worksheet.columns = [
    { header: "Calle", key: "street", width: 25 },
    { header: "Casa #", key: "houseNumber", width: 12 },
    { header: "Habitada", key: "inhabited", width: 12 },
    { header: "Agua", key: "water", width: 12 },
    { header: "Fecha Reporte", key: "reportDate", width: 15 },
    { header: "Comentarios", key: "comments", width: 50 },
  ];

  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: COLORS.headerText },
    size: 12,
  };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.headerBg },
  };
  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getRow(1).height = 25;

  const titleRow = worksheet.insertRow(1, [
    "Reporte de Tomas Directas en Fraccionamientos - JAPAMA",
  ]);
  titleRow.font = { bold: true, size: 16, color: { argb: COLORS.headerBg } };
  titleRow.height = 30;
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.mergeCells(1, 1, 1, 6);

  const infoRow = worksheet.insertRow(2, [
    `Fraccionamiento: ${subdivisionData.subdivision_name}`,
  ]);
  infoRow.font = { bold: true, size: 12 };
  infoRow.height = 20;
  worksheet.mergeCells(2, 1, 2, 6);

  const dateRow = worksheet.insertRow(3, [
    `Fecha de emisión: ${new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
  ]);
  dateRow.font = { size: 10, color: { argb: "FF64748b" } };
  dateRow.height = 18;
  worksheet.mergeCells(3, 1, 3, 6);

  worksheet.addRow([]);

  let totalCasas = 0;
  let casasHabitadas = 0;
  let casasConAgua = 0;

  subdivisionData.streets.forEach((street: any) => {
    if (!street.houses || street.houses.length === 0) return;

    street.houses.forEach((house: any) => {
      totalCasas++;
      if (house.inhabited === "1") casasHabitadas++;
      if (house.water === "1") casasConAgua++;

      if (house.reports && house.reports.length > 0) {
        house.reports.forEach((report: any, index: number) => {
          const row = worksheet.addRow({
            street: index === 0 ? street.street_name : "",
            houseNumber: index === 0 ? house.house_number : "",
            inhabited:
              index === 0 ? (house.inhabited === "1" ? "Sí" : "No") : "",
            water: index === 0 ? (house.water === "1" ? "Sí" : "No") : "",
            reportDate: new Date(report.report_date).toLocaleDateString(
              "es-MX"
            ),
            comments: report.comments || "Sin comentarios",
          });

          if (index === 0) {
            row.getCell("inhabited").fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb:
                  house.inhabited === "1" ? COLORS.successBg : COLORS.dangerBg,
              },
            };
            row.getCell("inhabited").font = {
              color: { argb: COLORS.headerText },
              bold: true,
            };

            row.getCell("water").fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: house.water === "1" ? COLORS.successBg : COLORS.dangerBg,
              },
            };
            row.getCell("water").font = {
              color: { argb: COLORS.headerText },
              bold: true,
            };
          }
        });
      } else {
        const row = worksheet.addRow({
          street: street.street_name,
          houseNumber: house.house_number,
          inhabited: house.inhabited === "1" ? "Sí" : "No",
          water: house.water === "1" ? "Sí" : "No",
          reportDate: "-",
          comments: "",
        });

        row.getCell("inhabited").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: house.inhabited === "1" ? COLORS.successBg : COLORS.dangerBg,
          },
        };
        row.getCell("inhabited").font = {
          color: { argb: COLORS.headerText },
          bold: true,
        };

        row.getCell("water").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: house.water === "1" ? COLORS.successBg : COLORS.dangerBg,
          },
        };
        row.getCell("water").font = {
          color: { argb: COLORS.headerText },
          bold: true,
        };
      }
    });
  });

  worksheet.addRow([]);
  const statsRow = worksheet.addRow([
    "Resumen:",
    `Total: ${totalCasas}`,
    `Habitadas: ${casasHabitadas} (${Math.round(
      (casasHabitadas / totalCasas) * 100
    )}%)`,
    `Con agua: ${casasConAgua} (${Math.round(
      (casasConAgua / totalCasas) * 100
    )}%)`,
  ]);
  statsRow.font = { bold: true, size: 11 };
  statsRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.lightGray },
  };

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 5) {
      row.alignment = { vertical: "middle", wrapText: true };
      row.border = {
        top: { style: "thin", color: { argb: "FFd1d5db" } },
        bottom: { style: "thin", color: { argb: "FFd1d5db" } },
      };
    }
  });

  return workbook;
};

export const generateAllSubdivisionsExcel = async () => {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "JAPAMA";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Todos los Fraccionamientos");

  worksheet.columns = [
    { header: "Fraccionamiento", key: "subdivision", width: 25 },
    { header: "Calle", key: "street", width: 25 },
    { header: "Casa #", key: "houseNumber", width: 12 },
    { header: "Habitada", key: "inhabited", width: 12 },
    { header: "Agua", key: "water", width: 12 },
    { header: "Fecha Reporte", key: "reportDate", width: 15 },
    { header: "Comentarios", key: "comments", width: 50 },
  ];

  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: COLORS.headerText },
    size: 12,
  };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.headerBg },
  };
  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getRow(1).height = 25;

  const titleRow = worksheet.insertRow(1, [
    "Reporte General de Tomas Directas - JAPAMA",
  ]);
  titleRow.font = { bold: true, size: 16, color: { argb: COLORS.headerBg } };
  titleRow.height = 30;
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.mergeCells(1, 1, 1, 7);

  const dateRow = worksheet.insertRow(2, [
    `Fecha de emisión: ${new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
  ]);
  dateRow.font = { size: 10, color: { argb: "FF64748b" } };
  dateRow.height = 18;
  worksheet.mergeCells(2, 1, 2, 7);

  worksheet.addRow([]);

  let totalCasas = 0;
  let casasHabitadas = 0;
  let casasConAgua = 0;

  subdivisionsData.forEach((subdivision: any) => {
    if (!subdivision.streets || subdivision.streets.length === 0) return;

    subdivision.streets.forEach((street: any) => {
      if (!street.houses || street.houses.length === 0) return;

      street.houses.forEach((house: any) => {
        totalCasas++;
        if (house.inhabited === "1") casasHabitadas++;
        if (house.water === "1") casasConAgua++;

        if (house.reports && house.reports.length > 0) {
          house.reports.forEach((report: any, index: number) => {
            const row = worksheet.addRow({
              subdivision: index === 0 ? subdivision.subdivision_name : "",
              street: index === 0 ? street.street_name : "",
              houseNumber: index === 0 ? house.house_number : "",
              inhabited:
                index === 0 ? (house.inhabited === "1" ? "Sí" : "No") : "",
              water: index === 0 ? (house.water === "1" ? "Sí" : "No") : "",
              reportDate: new Date(report.report_date).toLocaleDateString(
                "es-MX"
              ),
              comments: report.comments || "Sin comentarios",
            });

            if (index === 0) {
              row.getCell("inhabited").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb:
                    house.inhabited === "1"
                      ? COLORS.successBg
                      : COLORS.dangerBg,
                },
              };
              row.getCell("inhabited").font = {
                color: { argb: COLORS.headerText },
                bold: true,
              };

              row.getCell("water").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                  argb:
                    house.water === "1" ? COLORS.successBg : COLORS.dangerBg,
                },
              };
              row.getCell("water").font = {
                color: { argb: COLORS.headerText },
                bold: true,
              };
            }
          });
        } else {
          const row = worksheet.addRow({
            subdivision: subdivision.subdivision_name,
            street: street.street_name,
            houseNumber: house.house_number,
            inhabited: house.inhabited === "1" ? "Sí" : "No",
            water: house.water === "1" ? "Sí" : "No",
            reportDate: "-",
            comments: "",
          });

          row.getCell("inhabited").fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb:
                house.inhabited === "1" ? COLORS.successBg : COLORS.dangerBg,
            },
          };
          row.getCell("inhabited").font = {
            color: { argb: COLORS.headerText },
            bold: true,
          };

          row.getCell("water").fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: house.water === "1" ? COLORS.successBg : COLORS.dangerBg,
            },
          };
          row.getCell("water").font = {
            color: { argb: COLORS.headerText },
            bold: true,
          };
        }
      });
    });
  });

  worksheet.addRow([]);
  const statsRow = worksheet.addRow([
    "Resumen General:",
    "",
    `Total: ${totalCasas}`,
    `Habitadas: ${casasHabitadas} (${Math.round(
      (casasHabitadas / totalCasas) * 100
    )}%)`,
    `Con agua: ${casasConAgua} (${Math.round(
      (casasConAgua / totalCasas) * 100
    )}%)`,
  ]);
  statsRow.font = { bold: true, size: 11 };
  statsRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.lightGray },
  };

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 4) {
      row.alignment = { vertical: "middle", wrapText: true };
      row.border = {
        top: { style: "thin", color: { argb: "FFd1d5db" } },
        bottom: { style: "thin", color: { argb: "FFd1d5db" } },
      };
    }
  });

  return workbook;
};
