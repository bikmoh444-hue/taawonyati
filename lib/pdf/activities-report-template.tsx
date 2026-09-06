// Annual activities report PDF — honors the UI locale (unlike documents,
// which are always French). Mirrors the mobile annual report.

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
import type { Activity, Cooperative } from "@/lib/types";
import type { AppLocale } from "@/lib/constants";
import { fmtDateLong } from "@/lib/format";

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

const styles = StyleSheet.create({
  page: {
    fontFamily: "Amiri",
    fontSize: 9.5,
    color: "#1e293b",
    padding: 32,
    lineHeight: 1.45,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  titleBlock: { width: "60%" },
  title: { fontFamily: "AmiriBold", fontSize: 18, color: NAVY },
  subtitle: { fontSize: 10, color: GRAY, marginTop: 2 },
  logo: { width: 84, height: 84, objectFit: "contain" },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metaBox: {
    width: "48%",
    border: "1pt solid #e2e8f0",
    borderRadius: 6,
    padding: 8,
  },
  boxLabel: { fontFamily: "AmiriBold", fontSize: 8, color: GRAY },
  count: { fontFamily: "AmiriBold", fontSize: 16, color: TEAL, marginTop: 2 },
  card: {
    border: "1pt solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardName: { fontFamily: "AmiriBold", fontSize: 11, color: NAVY },
  cardDate: { fontSize: 8.5, color: GRAY },
  cardRow: { fontSize: 8.5, color: GRAY, marginTop: 3 },
  cardNotes: { fontSize: 8.5, color: NAVY, marginTop: 3 },
  photo: { width: "100%", height: 130, objectFit: "cover", marginTop: 8, borderRadius: 6 },
  footer: { marginTop: 14, fontSize: 7.5, color: GRAY, textAlign: "center" },
});

const label = (locale: AppLocale, ar: string, fr: string) =>
  locale === "ar" ? ar : fr;

export function ActivitiesReportPdf({
  activities,
  cooperative,
  year,
  locale,
}: {
  activities: Activity[];
  cooperative: Cooperative;
  year: number;
  locale: AppLocale;
}) {
  const coopName =
    cooperative.name_ar || cooperative.name_fr || cooperative.name || "";
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>
              {label(locale, `تقرير أنشطة ${coopName}`, `Rapport d'activités ${year}`)}
            </Text>
            <Text style={styles.subtitle}>
              {label(locale, "تقرير سنوي", `Année ${year}`)} · Taawoniati
            </Text>
          </View>
          {cooperative.logo_url ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={cooperative.logo_url} style={styles.logo} />
          ) : null}
        </View>

        <View style={styles.meta}>
          <View style={styles.metaBox}>
            <Text style={styles.boxLabel}>
              {label(locale, "عدد الأنشطة", "Nombre d'activités")}
            </Text>
            <Text style={styles.count}>{activities.length}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.boxLabel}>
              {label(locale, "التعاونية", "Coopérative")}
            </Text>
            <Text style={{ fontSize: 9.5, color: NAVY, marginTop: 2 }}>{coopName}</Text>
            <Text style={{ fontSize: 8, color: GRAY }}>{cooperative.address}</Text>
          </View>
        </View>

        {sorted.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{a.name}</Text>
              <Text style={styles.cardDate}>
                {fmtDateLong(a.date, locale === "ar" ? "ar" : "fr")}
              </Text>
            </View>
            {a.location ? (
              <Text style={styles.cardRow}>
                {label(locale, "المكان:", "Lieu :")} {a.location}
              </Text>
            ) : null}
            {a.notes ? <Text style={styles.cardNotes}>{a.notes}</Text> : null}
            {a.image_url ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={a.image_url} style={styles.photo} />
            ) : null}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardName}>
            {label(
              locale,
              "توقيع مسؤول التعاونية",
              "Signature du responsable de la coopérative"
            )}
          </Text>
          <View
            style={{
              borderTop: "0.75pt solid #cbd5e1",
              marginTop: 40,
              width: "40%",
            }}
          />
        </View>

        <Text style={styles.footer}>
          {coopName} ·{" "}
          {label(locale, "تقرير الأنشطة السنوي", "Rapport annuel d'activités")} · Taawoniati
        </Text>
      </Page>
    </Document>
  );
}