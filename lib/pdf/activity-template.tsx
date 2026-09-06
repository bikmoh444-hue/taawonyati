// Single activity PDF — honors the UI locale (like the annual report).
// Reuses the same visual charter (cooperative header, Amiri fonts, teal accents).

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
  title: { fontFamily: "AmiriBold", fontSize: 18, color: TEAL },
  subtitle: { fontSize: 10, color: GRAY, marginTop: 2 },
  logo: { width: 84, height: 84, objectFit: "contain" },
  card: {
    border: "1pt solid #e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardName: { fontFamily: "AmiriBold", fontSize: 13, color: NAVY },
  cardRow: { fontSize: 9, color: GRAY, marginTop: 4 },
  cardLabel: { fontFamily: "AmiriBold", color: NAVY },
  cardNotes: { fontSize: 9, color: NAVY, marginTop: 6 },
  photo: { width: "100%", height: 220, objectFit: "cover", marginTop: 10, borderRadius: 6 },
  footer: { marginTop: 14, fontSize: 7.5, color: GRAY, textAlign: "center" },
});

const label = (locale: AppLocale, ar: string, fr: string) =>
  locale === "ar" ? ar : fr;

export function ActivityPdf({
  activity,
  cooperative,
  locale,
}: {
  activity: Activity;
  cooperative: Cooperative;
  locale: AppLocale;
}) {
  const coopName =
    cooperative.name_ar || cooperative.name_fr || cooperative.name || "";
  const l = locale === "ar" ? "ar" : "fr";

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>
              {label(locale, "نشاط", "Fiche d'activité")}
            </Text>
            <Text style={styles.subtitle}>
              {coopName}
            </Text>
          </View>
          {cooperative.logo_url ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={cooperative.logo_url} style={styles.logo} />
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardName}>{activity.name}</Text>

          <Text style={styles.cardRow}>
            <Text style={styles.cardLabel}>
              {label(locale, "التاريخ :", "Date :")}
            </Text>{" "}
            {fmtDateLong(activity.date, l)}
          </Text>

          {activity.location ? (
            <Text style={styles.cardRow}>
              <Text style={styles.cardLabel}>
                {label(locale, "المكان :", "Lieu :")}
              </Text>{" "}
              {activity.location}
            </Text>
          ) : null}

          {activity.notes ? (
            <Text style={styles.cardNotes}>{activity.notes}</Text>
          ) : null}
        </View>

        {activity.image_url ? (
          <View style={{ border: "1pt solid #e2e8f0", borderRadius: 8, padding: 8 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={activity.image_url} style={styles.photo} />
            <Text style={{ fontSize: 8, color: GRAY, textAlign: "center", marginTop: 4 }}>
              {label(locale, "صورة النشاط", "Photo de l'activité")}
            </Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          {coopName} · {label(locale, "نشاط", "Activité")} · Taawoniati
        </Text>
      </Page>
    </Document>
  );
}
