// French document PDF (FAC/DEV/BDL/BDC) — mirrors the mobile template.
// Always generated in French regardless of the UI locale.

import path from "path";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  Client,
  Cooperative,
  DocumentItem,
  DocumentRow,
} from "@/lib/types";
import { fmtMoney, fmtDate } from "@/lib/format";
import { toFrenchWords } from "@/lib/numbers/amount-to-words";

export const PDF_WIDTH = 595.28;
export const PDF_HEIGHT = 841.89;

const FONT_DIR = path.join(process.cwd(), "lib", "pdf", "fonts");

Font.register({
  family: "Amiri",
  src: path.join(FONT_DIR, "Amiri-Regular.ttf"),
});

Font.register({
  family: "AmiriBold",
  src: path.join(FONT_DIR, "Amiri-Bold.ttf"),
});

const TEAL = "#0d9488";
const NAVY = "#0f172a";
const GRAY = "#64748b";
const LIGHT = "#f1f5f9";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Amiri",
    fontSize: 9.5,
    color: "#1e293b",
    padding: 32,
    lineHeight: 1.45,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  coopBlock: { width: "60%" },
  coopName: {
    fontFamily: "AmiriBold",
    fontSize: 15,
    color: NAVY,
    marginBottom: 3,
  },
  coopLine: { fontSize: 8.5, color: GRAY },
  logo: { width: 84, height: 84, objectFit: "contain" },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "AmiriBold",
    fontSize: 20,
    color: TEAL,
    letterSpacing: 1,
  },
  numDate: { textAlign: "right", fontSize: 9.5, color: NAVY },
  recipientsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  recipientBox: {
    width: "48%",
    border: "1pt solid #e2e8f0",
    borderRadius: 6,
    padding: 10,
    minHeight: 74,
  },
  boxLabel: {
    fontFamily: "AmiriBold",
    fontSize: 8,
    color: GRAY,
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  boxName: { fontFamily: "AmiriBold", fontSize: 10, color: NAVY },
  boxLine: { fontSize: 8, color: GRAY },
  table: { width: "100%", marginBottom: 12 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: LIGHT,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeadCell: {
    fontFamily: "AmiriBold",
    fontSize: 8,
    color: NAVY,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottom: "0.5pt solid #e2e8f0",
  },
  tableCell: { fontSize: 8.5 },
  colRef: { width: "18%" },
  colDesc: { width: "34%" },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "12%", textAlign: "center" },
  colPrice: { width: "13%", textAlign: "right" },
  colTotal: { width: "13%", textAlign: "right" },
  totalsBlock: { width: 230, alignSelf: "flex-end", marginBottom: 10 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
    fontSize: 9,
  },
  totalsRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: TEAL,
    color: "#ffffff",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  totalAmount: { fontFamily: "AmiriBold", fontSize: 11 },
  words: {
    fontSize: 8.5,
    color: NAVY,
    border: "0.5pt solid #e2e8f0",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  wordsLabel: { fontFamily: "AmiriBold", fontSize: 8, color: GRAY },
  notes: {
    fontSize: 8.5,
    color: GRAY,
    border: "0.5pt solid #e2e8f0",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  signature: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  signatureBlock: {
    width: "40%",
    borderTop: "0.75pt solid #cbd5e1",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 8.5,
    color: NAVY,
  },
  footerNote: {
    marginTop: 26,
    fontSize: 7.5,
    color: GRAY,
    textAlign: "center",
  },
});

const TYPE_TITLES: Record<DocumentRow["type"], string> = {
  FAC: "FACTURE",
  DEV: "DEVIS",
  BDL: "BON DE LIVRAISON",
  BDC: "BON DE COMMANDE",
};

function Divider() {
  return <View style={{ height: 0, borderBottom: "0.5pt solid #e2e8f0", marginVertical: 4 }} />;
}

export function DocumentPdf({
  record,
  items,
  client,
  cooperative,
}: {
  record: DocumentRow;
  items: DocumentItem[];
  client: Client | null;
  cooperative: Cooperative;
}) {
  const subTotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const words = toFrenchWords(record.total ?? 0);

  const coopName =
    cooperative.name_fr || cooperative.name_ar || cooperative.name || "";
  const coords = [cooperative.address, cooperative.phone, cooperative.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <Document>
      <Page size={{ width: PDF_WIDTH, height: PDF_HEIGHT }} style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.coopBlock}>
            <Text style={styles.coopName}>
              {coopName}
            </Text>
            {coords ? <Text style={styles.coopLine}>{coords}</Text> : null}
            {cooperative.ice ? (
              <Text style={styles.coopLine}>ICE : {cooperative.ice}</Text>
            ) : null}
            {cooperative.rlc ? (
              <Text style={styles.coopLine}>RC : {cooperative.rlc}</Text>
            ) : null}
            {cooperative.if_number ? (
              <Text style={styles.coopLine}>IF : {cooperative.if_number}</Text>
            ) : null}
          </View>
          {cooperative.logo_url ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={cooperative.logo_url} style={styles.logo} />
          ) : null}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{TYPE_TITLES[record.type]}</Text>
          <View style={styles.numDate}>
            <Text>
              {record.type === "DEV" && record.name ? `${record.name} · ` : ""}
              N° : {record.number}
            </Text>
            <Text>Date : {fmtDate(record.date, "fr")}</Text>
          </View>
        </View>
        <Divider />

        <View style={styles.recipientsRow}>
          <View style={styles.recipientBox}>
            <Text style={styles.boxLabel}>{`À l'attention de`}</Text>
            {client ? (
              <>
                <Text style={styles.boxName}>{client.name}</Text>
                <Text style={styles.boxLine}>{client.address}</Text>
                <Text style={styles.boxLine}>ICE : {client.ice}</Text>
                <Text style={styles.boxLine}>Tél : {client.phone}</Text>
              </>
            ) : (
              <Text style={styles.boxLine}>—</Text>
            )}
          </View>
          <View style={styles.recipientBox}>
            <Text style={styles.boxLabel}>Délivrée par</Text>
            <Text style={styles.boxName}>{coopName}</Text>
            <Text style={styles.boxLine}>{cooperative.address}</Text>
            <Text style={styles.boxLine}>Tél : {cooperative.phone}</Text>
            {record.type === "BDL" && (
              <>
                <Divider />
                <Text style={styles.boxLine}>
                  Lieu de livraison : {record.delivery_location || "—"}
                </Text>
                <Text style={styles.boxLine}>
                  Délai : {record.delivery_delay || "—"}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, styles.colRef]}>Réf</Text>
            <Text style={[styles.tableHeadCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeadCell, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeadCell, styles.colUnit]}>Unité</Text>
            <Text style={[styles.tableHeadCell, styles.colPrice]}>P.U</Text>
            <Text style={[styles.tableHeadCell, styles.colTotal]}>Total</Text>
          </View>
          {items.map((it, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colRef]}>
                {it.product_ref || ""}
              </Text>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {it.description || ""}
              </Text>
              <Text style={[styles.tableCell, styles.colQty]}>{it.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{it.unit || ""}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {fmtMoney(it.unit_price, "fr")}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal]}>
                {fmtMoney(it.quantity * it.unit_price, "fr")}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text>Sous-total</Text>
            <Text>{fmtMoney(subTotal, "fr")}</Text>
          </View>
          {record.discount ? (
            <View style={styles.totalsRow}>
              <Text>Remise</Text>
              <Text>- {fmtMoney(record.discount, "fr")}</Text>
            </View>
          ) : null}
          {record.tva_rate ? (
            <View style={styles.totalsRow}>
              <Text>TVA ({record.tva_rate}%)</Text>
              <Text>{fmtMoney(record.tva_amount, "fr")}</Text>
            </View>
          ) : null}
          {record.delivery_fees ? (
            <View style={styles.totalsRow}>
              <Text>Frais de livraison</Text>
              <Text>{fmtMoney(record.delivery_fees, "fr")}</Text>
            </View>
          ) : null}
          <View style={styles.totalsRowTotal}>
            <Text>TOTAL</Text>
            <Text style={styles.totalAmount}>{fmtMoney(record.total ?? 0, "fr")}</Text>
          </View>
        </View>

        <View style={styles.words}>
          <Text style={styles.wordsLabel}>Arrêté à la somme de :</Text>
          <Text style={{ fontSize: 9.5, color: NAVY }}>
            {words} dirhams
          </Text>
        </View>

        {record.type === "FAC" && record.tva_rate === 0 && (
          <Text style={styles.notes}>
            Note : TVA non applicable, article 91 du Code Général des Impôts.
          </Text>
        )}

        {(record.notes || record.additional_info) && (
          <View style={styles.notes}>
            <Text style={styles.wordsLabel}>Notes</Text>
            <Text style={{ color: NAVY }}>
              {record.notes || record.additional_info}
            </Text>
          </View>
        )}

        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <Text>Signature &amp; cachet</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text>Fait le {fmtDate(record.date, "fr")}</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          {coopName} · {record.number} · Document généré par Taawoniati
        </Text>
      </Page>
    </Document>
  );
}