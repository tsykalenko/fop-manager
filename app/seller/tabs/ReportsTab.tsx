"use client";
import { useState, useEffect } from "react";
// Шляхи до компонентів звітів:
import { CreateReport } from "../../reports/components/CreateReport";
import { ReportPreview } from "../../reports/components/ReportPreview";
import { ReportList } from "../../reports/components/ReportList";

interface Props { userId: string | null; }

export default function ReportsTab({ userId }: Props) {
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [validationError, setValidationError] = useState<string[] | null>(null);

  useEffect(() => { fetchSavedReports(); }, []);

  async function fetchSavedReports() { const res = await fetch("/api/reports"); const data = await res.json(); if (Array.isArray(data)) setSavedReports(data); }

  const generateReport = async () => {
    if (!reportStartDate || !reportEndDate) return alert("Виберіть дати!");
    setValidationError(null); setReportData(null);
    const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate", start_date: reportStartDate, end_date: reportEndDate }) });
    const data = await res.json();
    if (res.status === 400 && data.error === "validation_failed") { setValidationError(data.badDates); return; }
    if (res.ok) setReportData(data);
  };

  const saveReport = async () => {
      if (!reportData || !userId || !confirm("Відправити?")) return;
      const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", start_date: reportStartDate, end_date: reportEndDate, total_income: reportData.totalIncome, total_expense: reportData.totalExpense, total_writeoff: reportData.totalWriteoff, author_id: userId }) });
      if (res.ok) { alert("Відправлено!"); setReportData(null); fetchSavedReports(); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
        <CreateReport startDate={reportStartDate} setStartDate={setReportStartDate} endDate={reportEndDate} setEndDate={setReportEndDate} onGenerate={generateReport} validationError={validationError} />
        <ReportPreview data={reportData} startDate={reportStartDate} endDate={reportEndDate} onSave={saveReport} />
        <ReportList reports={savedReports} onTakeSalary={() => {}} />
    </div>
  );
}