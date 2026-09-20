import { allUnitsContent } from '../../content/courses/21909-2020';
import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';
import { AssessmentsHubClient } from '../../components/portal/AssessmentsHubClient';

export default function AssessmentsPage() {
    return (
        <>
            <PortalGlobalNav />
            <main className="portal-document-page">
                <a className="portal-back-link" href="/">← กลับหน้าภาพรวม</a>
                <p className="portal-kicker">ASSESSMENTS & MEASUREMENT</p>
                <h1>แบบทดสอบและการวัดผล (ครบทั้ง 8 หน่วย)</h1>
                <p>
                    เครื่องมือวัดและประเมินผลการเรียนรู้รายวิชาระบบกล้องวงจรปิดบนเครือข่าย (21909-2020)
                    ประกอบด้วยระบบทำข้อสอบปรนัยประจำหน่วย และแบบทดสอบอัตนัยวิเคราะห์ปัญหาด้วยหลักฐาน 6 ขั้นตอน
                </p>

                <AssessmentsHubClient bundles={allUnitsContent} />
            </main>
        </>
    );
}
