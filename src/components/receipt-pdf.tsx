import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1 solid #eee',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  orgName: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    marginBottom: 8,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    paddingBottom: 8,
    paddingTop: 8,
  },
  col1: { width: '60%' },
  col2: { width: '20%', textAlign: 'right' },
  col3: { width: '20%', textAlign: 'right' },
  th: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  td: { fontSize: 12 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 20,
    borderTop: '2 solid #333',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 10,
    borderTop: '1 solid #eee',
    paddingTop: 20,
  }
});

export const ReceiptPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>FEE RECEIPT</Text>
          <Text style={styles.value}>Receipt #{data.receiptNumber}</Text>
          <Text style={styles.value}>Date: {data.paymentDate}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.orgName}>{data.orgName}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 30 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Billed To:</Text>
          <Text style={styles.value}>{data.studentName}</Text>
          <Text style={styles.value}>{data.studentPhone}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Payment Details:</Text>
          <Text style={styles.value}>Method: {data.paymentMethod}</Text>
          <Text style={styles.value}>Ref: {data.reference || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, styles.th]}>Description</Text>
          <Text style={[styles.col2, styles.th]}>Course</Text>
          <Text style={[styles.col3, styles.th]}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.col1, styles.td]}>{data.description}</Text>
          <Text style={[styles.col2, styles.td]}>{data.courseName}</Text>
          <Text style={[styles.col3, styles.td]}>Rs. {data.amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Amount Paid:</Text>
        <Text style={styles.totalValue}>Rs. {data.amount.toFixed(2)}</Text>
      </View>

      <View style={styles.footer}>
        <Text>This is a computer-generated receipt and does not require a signature.</Text>
      </View>
    </Page>
  </Document>
);
