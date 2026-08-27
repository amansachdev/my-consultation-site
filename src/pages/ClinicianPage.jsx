import { PDFDownloadLink, Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useEffect, useMemo, useState } from 'react';
import { FileDown, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { apiRequest } from '../lib/api';
import { brand, doctor } from '../constants';
import { LoadingState } from '../components/LoadingState';

const blankMedicine = () => ({ name: '', strength: '', dose: '', frequency: '', duration: '', instructions: '' });

const pdfStyles = StyleSheet.create({
  page: { padding: 48, color: '#20201d', fontFamily: 'Helvetica', fontSize: 10 },
  header: { alignItems: 'center', borderBottom: '1pt solid #dfe3da', paddingBottom: 20 },
  logo: { width: 92, height: 92, objectFit: 'contain', marginBottom: 10 },
  doctorName: { fontFamily: 'Times-Bold', fontSize: 21, marginBottom: 4 },
  qualification: { fontSize: 10, color: '#4a4a46' },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 26, paddingHorizontal: 8 },
  contact: { width: '31%', alignItems: 'center' },
  contactLabel: { fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  contactValue: { color: '#4a4a46', textAlign: 'center' },
  title: { fontFamily: 'Times-Bold', fontSize: 18, marginTop: 26, marginBottom: 16 },
  patientBox: { border: '1pt solid #dfe3da', padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  patientItem: { width: '31%' },
  label: { fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  value: { color: '#4a4a46' },
  table: { marginTop: 22, border: '1pt solid #b9c5b8' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e8eee4', fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', borderTop: '1pt solid #dfe3da', minHeight: 34 },
  cell: { padding: 7, borderRight: '1pt solid #dfe3da' },
  medicine: { width: '22%' },
  strength: { width: '13%' },
  dose: { width: '13%' },
  frequency: { width: '16%' },
  duration: { width: '13%' },
  instructions: { width: '23%', borderRight: 0 },
  footer: { position: 'absolute', bottom: 28, left: 48, right: 48, alignItems: 'center', color: '#4a4a46', fontSize: 9 },
});

function PrescriptionDocument({ patient, medicines, date }) {
  return (
    <Document title={`Antaran prescription - ${patient.name}`} author={doctor.name}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Image src={brand.logo} style={pdfStyles.logo} />
          <Text style={pdfStyles.doctorName}>{doctor.name}</Text>
          <Text style={pdfStyles.qualification}>MBBS, MD Psychiatry  |  KMC: 143480</Text>
          <View style={pdfStyles.contactRow}>
            <View style={pdfStyles.contact}><Text style={pdfStyles.contactLabel}>Website</Text><Text style={pdfStyles.contactValue}>antaran.online</Text></View>
            <View style={pdfStyles.contact}><Text style={pdfStyles.contactLabel}>Email</Text><Text style={pdfStyles.contactValue}>{doctor.email}</Text></View>
            <View style={pdfStyles.contact}><Text style={pdfStyles.contactLabel}>WhatsApp / Call</Text><Text style={pdfStyles.contactValue}>{doctor.phone}</Text></View>
          </View>
        </View>
        <Text style={pdfStyles.title}>Prescription</Text>
        <View style={pdfStyles.patientBox}>
          <View style={pdfStyles.patientItem}><Text style={pdfStyles.label}>Patient</Text><Text style={pdfStyles.value}>{patient.name}</Text></View>
          <View style={pdfStyles.patientItem}><Text style={pdfStyles.label}>Age</Text><Text style={pdfStyles.value}>{patient.age} years</Text></View>
          <View style={pdfStyles.patientItem}><Text style={pdfStyles.label}>Date</Text><Text style={pdfStyles.value}>{date}</Text></View>
        </View>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.cell, pdfStyles.medicine]}>Medicine</Text>
            <Text style={[pdfStyles.cell, pdfStyles.strength]}>Strength</Text>
            <Text style={[pdfStyles.cell, pdfStyles.dose]}>Dose</Text>
            <Text style={[pdfStyles.cell, pdfStyles.frequency]}>Frequency</Text>
            <Text style={[pdfStyles.cell, pdfStyles.duration]}>Duration</Text>
            <Text style={[pdfStyles.cell, pdfStyles.instructions]}>Instructions</Text>
          </View>
          {medicines.map((medicine, index) => (
            <View style={pdfStyles.tableRow} key={`${medicine.name}-${index}`}>
              <Text style={[pdfStyles.cell, pdfStyles.medicine]}>{medicine.name}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.strength]}>{medicine.strength}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.dose]}>{medicine.dose}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.frequency]}>{medicine.frequency}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.duration]}>{medicine.duration}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.instructions]}>{medicine.instructions}</Text>
            </View>
          ))}
        </View>
        <View style={pdfStyles.footer}>
          <Text>ANTARAN  •  Online consultations across India</Text>
          <Text>{doctor.email}  •  antaran.online</Text>
        </View>
      </Page>
    </Document>
  );
}

export function ClinicianPage() {
  return <PrescriptionWorkspace accessPath="/clinician/access" accessLabel="Clinician" />;
}

export function PrescriptionWorkspace({ accessPath = '/workspace-access', accessLabel = 'Admin', embedded = false }) {
  const { isAuthenticated, signIn, status } = useAuth();
  const [access, setAccess] = useState('checking');
  const [patient, setPatient] = useState({ name: '', age: '' });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [medicines, setMedicines] = useState([blankMedicine()]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAuthenticated) {
      setAccess('signed-out');
      return;
    }
    apiRequest(accessPath)
      .then(() => setAccess('allowed'))
      .catch((requestError) => setAccess(requestError.status === 403 ? 'forbidden' : 'error'));
  }, [accessPath, isAuthenticated, status]);

  const updateMedicine = (index, field, value) => {
    setMedicines((current) => current.map((medicine, medicineIndex) => medicineIndex === index ? { ...medicine, [field]: value } : medicine));
  };
  const updatePatient = (field, value) => {
    setPatient((current) => ({ ...current, [field]: value }));
  };
  const filename = `antaran-prescription-${patient.name.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'patient'}-${date}.pdf`;
  const pdfDocument = useMemo(() => <PrescriptionDocument patient={patient} medicines={medicines} date={date} />, [date, medicines, patient]);
  const isValid = patient.name.trim() && Number(patient.age) >= 18 && Number(patient.age) <= 120 && date && medicines.every((medicine) => Object.values(medicine).every((value) => value.trim()));

  if (status === 'loading' || access === 'checking') {
    const loader = <LoadingState text="Checking clinician access..." />;
    return embedded ? loader : <ClinicianShell>{loader}</ClinicianShell>;
  }
  if (access === 'signed-out') {
    const panel = <AccessPanel title={`${accessLabel} sign-in required`} text="Sign in with an authorized Antaran account to use the prescription generator." action={<button type="button" className="btn-primary" onClick={signIn}>Sign in with Google</button>} />;
    return embedded ? panel : <ClinicianShell>{panel}</ClinicianShell>;
  }
  if (access === 'forbidden') {
    const panel = <AccessPanel title="Access restricted" text="This workspace is available only to an authorized Antaran admin account." />;
    return embedded ? panel : <ClinicianShell>{panel}</ClinicianShell>;
  }
  if (access === 'error') {
    const panel = <AccessPanel title="Could not verify access" text="Please try again after signing in." />;
    return embedded ? panel : <ClinicianShell>{panel}</ClinicianShell>;
  }

  const validateDownload = (event) => {
    if (!isValid) {
      event.preventDefault();
      setError('Complete every patient and medicine field before downloading.');
      return;
    }
    setError('');
  };

  const content = (
    <div className="mx-auto grid max-w-5xl gap-6">
      <section className="booking-form">
        <h2 className="text-xl font-bold">Patient details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="field sm:col-span-2"><span>Full name *</span><input value={patient.name} onChange={(event) => updatePatient('name', event.target.value)} /></label>
          <label className="field"><span>Age *</span><input type="number" min="18" max="120" value={patient.age} onChange={(event) => updatePatient('age', event.target.value)} /></label>
        </div>
        <label className="field"><span>Prescription date *</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      </section>
      <section className="booking-form">
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Medicines</h2><button type="button" className="btn-secondary min-h-10 px-4 text-sm" onClick={() => setMedicines((current) => [...current, blankMedicine()])}><Plus size={16} /> Add medicine</button></div>
        <div className="grid gap-5">
          {medicines.map((medicine, index) => (
            <div className="grid gap-4 rounded-md border border-line bg-mist p-4" key={`medicine-${index}`}>
              <div className="flex items-center justify-between"><p className="font-semibold">Medicine {index + 1}</p>{medicines.length > 1 && <button type="button" className="inline-flex min-h-10 min-w-10 items-center justify-center text-semantic-danger" aria-label={`Remove medicine ${index + 1}`} onClick={() => setMedicines((current) => current.filter((_, medicineIndex) => medicineIndex !== index))}><Trash2 size={17} /></button>}</div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {['name', 'strength', 'dose', 'frequency', 'duration', 'instructions'].map((field) => <label className="field" key={field}><span>{field[0].toUpperCase() + field.slice(1)} *</span><input value={medicine[field]} onChange={(event) => updateMedicine(index, field, event.target.value)} /></label>)}
              </div>
            </div>
          ))}
        </div>
        {error && <p className="rounded-md bg-semantic-danger/10 p-3 text-sm font-medium text-semantic-danger" role="alert">{error}</p>}
        <PDFDownloadLink document={pdfDocument} fileName={filename} onClick={validateDownload} className="btn-primary justify-center sm:justify-self-start">
          {({ loading }) => <><FileDown size={17} /> {loading ? 'Preparing PDF...' : 'Download prescription PDF'}</>}
        </PDFDownloadLink>
      </section>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <ClinicianShell>
      <div className="section-heading text-left">
        <p className="eyebrow">{accessLabel} workspace</p>
        <h1>Prepare a prescription.</h1>
        <p>Enter the patient and medicine details manually. The document is generated locally and is not saved to Antaran.</p>
      </div>
      {content}
    </ClinicianShell>
  );
}

function ClinicianShell({ children }) {
  return <div className="min-h-[calc(100vh-4rem)] bg-white">{children}</div>;
}

function AccessPanel({ title, text, action }) {
  return <section className="section"><div className="mx-auto max-w-xl rounded-lg border border-line bg-mist p-8 text-center shadow-sm"><h1 className="font-serif text-3xl font-semibold">{title}</h1><p className="mt-3 leading-7 text-ink/70">{text}</p>{action && <div className="mt-6 flex justify-center">{action}</div>}</div></section>;
}
