import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontFamily: "Noto Sans Ethiopic",
  },
  header: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: "center",
  },
});

const ReportPDF = ({ reportData, dateRange }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Financial Report</Text>
      <Text style={styles.date}>{dateRange}</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Date</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Product Name</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Amount (ETB)</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>DR/CR</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>User</Text>
          </View>
        </View>
        {/* Table Rows */}
        {reportData.map((row, idx) => (
          <View style={styles.tableRow} key={idx}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{row.date}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{row.productName}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {typeof row.amount === "number"
                  ? row.amount.toFixed(2)
                  : "0.00"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{row.type}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{row.user}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>
        Generated on: {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);

export default ReportPDF;
