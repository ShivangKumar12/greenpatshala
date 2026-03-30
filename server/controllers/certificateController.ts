// server/controllers/certificateController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { certificateTemplates, certificates, users, quizzes, courses } from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ============================================
// HELPER: Generate unique certificate ID
// ============================================
function generateCertificateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const seg1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const seg2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `CERT-${seg1}-${seg2}`;
}

// ============================================
// HELPER: Generate certificate PDF
// ============================================
async function generateCertificatePDF(certData: {
    certificateId: string;
    userName: string;
    itemName: string;
    achievementText: string;
    completionDate: string;
    templateFields?: any[];
    backgroundImage?: string | null;
}): Promise<string> {
    const uploadsDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${certData.certificateId}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Background
        if (certData.backgroundImage && fs.existsSync(path.join(__dirname, '../../', certData.backgroundImage))) {
            try {
                doc.image(path.join(__dirname, '../../', certData.backgroundImage), 0, 0, {
                    width: pageWidth,
                    height: pageHeight,
                });
            } catch {
                drawDefaultBackground(doc, pageWidth, pageHeight);
            }
        } else {
            drawDefaultBackground(doc, pageWidth, pageHeight);
        }

        // If template has positioned fields, use them
        if (certData.templateFields && certData.templateFields.length > 0) {
            const fieldValues: Record<string, string> = {
                '{user_name}': certData.userName,
                '{course_name}': certData.itemName,
                '{completion_date}': certData.completionDate,
                '{certificate_id}': certData.certificateId,
                '{achievement_text}': certData.achievementText,
            };

            certData.templateFields.forEach((field: any) => {
                const value = fieldValues[field.type] || field.type;
                if (value) {
                    doc.font('Helvetica')
                        .fontSize(field.fontSize || 16)
                        .fillColor(field.fontColor || '#333333')
                        .text(value, field.x || 0, field.y || 0, {
                            width: field.width || pageWidth,
                            align: 'center',
                        });
                }
            });
        } else {
            // Default layout
            drawDefaultCertificateContent(doc, certData, pageWidth, pageHeight);
        }

        doc.end();

        stream.on('finish', () => {
            resolve(`/uploads/certificates/${fileName}`);
        });
        stream.on('error', reject);
    });
}

function drawDefaultBackground(doc: PDFKit.PDFDocument, pageWidth: number, pageHeight: number) {
    // Elegant gradient-like background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFFDF5');

    // Border
    const borderMargin = 30;
    doc.lineWidth(3)
        .rect(borderMargin, borderMargin, pageWidth - borderMargin * 2, pageHeight - borderMargin * 2)
        .stroke('#C9A96E');

    // Inner border
    const innerMargin = 40;
    doc.lineWidth(1)
        .rect(innerMargin, innerMargin, pageWidth - innerMargin * 2, pageHeight - innerMargin * 2)
        .stroke('#E8D5A3');

    // Corner decorations
    const corners = [
        { x: borderMargin + 5, y: borderMargin + 5 },
        { x: pageWidth - borderMargin - 25, y: borderMargin + 5 },
        { x: borderMargin + 5, y: pageHeight - borderMargin - 25 },
        { x: pageWidth - borderMargin - 25, y: pageHeight - borderMargin - 25 },
    ];

    corners.forEach(corner => {
        doc.save();
        doc.circle(corner.x + 10, corner.y + 10, 8)
            .lineWidth(1.5)
            .stroke('#C9A96E');
        doc.restore();
    });
}

function drawDefaultCertificateContent(
    doc: PDFKit.PDFDocument,
    certData: { certificateId: string; userName: string; itemName: string; achievementText: string; completionDate: string },
    pageWidth: number,
    pageHeight: number,
) {
    const centerX = pageWidth / 2;

    // Title
    doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#C9A96E')
        .text('★ CERTIFICATE OF ACHIEVEMENT ★', 0, 70, { align: 'center', width: pageWidth });

    // "This is to certify that"
    doc.font('Helvetica')
        .fontSize(14)
        .fillColor('#666666')
        .text('This is to certify that', 0, 130, { align: 'center', width: pageWidth });

    // User Name
    doc.font('Helvetica-Bold')
        .fontSize(36)
        .fillColor('#1a1a2e')
        .text(certData.userName, 0, 160, { align: 'center', width: pageWidth });

    // Decorative line under name
    const lineY = 205;
    doc.moveTo(centerX - 150, lineY)
        .lineTo(centerX + 150, lineY)
        .lineWidth(2)
        .stroke('#C9A96E');

    // Achievement text
    doc.font('Helvetica')
        .fontSize(14)
        .fillColor('#444444')
        .text(certData.achievementText, 80, 225, {
            align: 'center',
            width: pageWidth - 160,
        });

    // Course/Quiz name
    doc.font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#1a1a2e')
        .text(certData.itemName, 80, 270, {
            align: 'center',
            width: pageWidth - 160,
        });

    // Date and Certificate ID
    doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#888888')
        .text(`Date: ${certData.completionDate}`, 80, 370, {
            align: 'center',
            width: pageWidth - 160,
        });

    doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#aaaaaa')
        .text(`Certificate ID: ${certData.certificateId}`, 80, 390, {
            align: 'center',
            width: pageWidth - 160,
        });

    // Signature line
    const sigY = 440;
    doc.moveTo(centerX - 80, sigY)
        .lineTo(centerX + 80, sigY)
        .lineWidth(1)
        .stroke('#999999');

    doc.font('Helvetica')
        .fontSize(10)
        .fillColor('#888888')
        .text('Authorized Signature', 0, sigY + 5, { align: 'center', width: pageWidth });

    // Footer
    doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#bbbbbb')
        .text('Powered by Unchi Udaan', 0, pageHeight - 55, { align: 'center', width: pageWidth });
}

// ============================================
// PUBLIC: Generate certificate (called internally)
// ============================================
export async function generateCertificateForUser(data: {
    userId: number;
    type: 'course' | 'quiz';
    courseId?: number;
    quizId?: number;
    attemptId?: number;
    userName: string;
    itemName: string;
}): Promise<any> {
    try {
        const certId = generateCertificateId();
        const completionDate = new Date().toISOString().split('T')[0];
        const achievementText = data.type === 'quiz'
            ? `has successfully passed the quiz`
            : `has successfully completed the course`;

        // Get default template if exists
        const [defaultTemplate] = await db
            .select()
            .from(certificateTemplates)
            .where(eq(certificateTemplates.isDefault, true))
            .limit(1);

        let templateFields: any[] = [];
        let backgroundImage: string | null = null;

        if (defaultTemplate) {
            templateFields = defaultTemplate.fields as any[];
            backgroundImage = defaultTemplate.backgroundImage;
        }

        // Generate PDF
        const pdfUrl = await generateCertificatePDF({
            certificateId: certId,
            userName: data.userName,
            itemName: data.itemName,
            achievementText,
            completionDate,
            templateFields,
            backgroundImage,
        });

        // Save to database
        const [result] = await db.insert(certificates).values({
            certificateId: certId,
            userId: data.userId,
            templateId: defaultTemplate?.id || null,
            type: data.type,
            courseId: data.courseId || null,
            quizId: data.quizId || null,
            attemptId: data.attemptId || null,
            userName: data.userName,
            itemName: data.itemName,
            achievementText,
            completionDate,
            pdfUrl,
        });

        return { id: result.insertId, certificateId: certId, pdfUrl };
    } catch (error: any) {
        console.error('[GENERATE CERTIFICATE ERROR]', error);
        throw error;
    }
}

// ============================================
// ADMIN: Get all templates
// ============================================
export async function getTemplates(req: Request, res: Response): Promise<Response> {
    try {
        const templates = await db
            .select()
            .from(certificateTemplates)
            .orderBy(desc(certificateTemplates.createdAt));

        return res.json({ success: true, templates });
    } catch (error: any) {
        console.error('[GET TEMPLATES ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch templates', error: error.message });
    }
}

// ============================================
// ADMIN: Create template
// ============================================
export async function createTemplate(req: Request, res: Response): Promise<Response> {
    try {
        const { name, backgroundImage, fields, isDefault } = req.body;

        if (!name || !fields) {
            return res.status(400).json({ success: false, message: 'Name and fields are required' });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await db.update(certificateTemplates)
                .set({ isDefault: false })
                .where(eq(certificateTemplates.isDefault, true));
        }

        const [result] = await db.insert(certificateTemplates).values({
            name,
            backgroundImage: backgroundImage || null,
            fields: typeof fields === 'string' ? fields : JSON.stringify(fields),
            isDefault: isDefault || false,
        });

        return res.status(201).json({
            success: true,
            message: 'Template created successfully',
            templateId: result.insertId,
        });
    } catch (error: any) {
        console.error('[CREATE TEMPLATE ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to create template', error: error.message });
    }
}

// ============================================
// ADMIN: Update template
// ============================================
export async function updateTemplate(req: Request, res: Response): Promise<Response> {
    try {
        const templateId = Number(req.params.id);
        const { name, backgroundImage, fields, isDefault } = req.body;

        const [existing] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, templateId)).limit(1);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        if (isDefault) {
            await db.update(certificateTemplates)
                .set({ isDefault: false })
                .where(eq(certificateTemplates.isDefault, true));
        }

        await db.update(certificateTemplates).set({
            ...(name && { name }),
            ...(backgroundImage !== undefined && { backgroundImage }),
            ...(fields && { fields: typeof fields === 'string' ? fields : JSON.stringify(fields) }),
            ...(isDefault !== undefined && { isDefault }),
        }).where(eq(certificateTemplates.id, templateId));

        return res.json({ success: true, message: 'Template updated successfully' });
    } catch (error: any) {
        console.error('[UPDATE TEMPLATE ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to update template', error: error.message });
    }
}

// ============================================
// ADMIN: Delete template
// ============================================
export async function deleteTemplate(req: Request, res: Response): Promise<Response> {
    try {
        const templateId = Number(req.params.id);

        const [existing] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, templateId)).limit(1);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        await db.delete(certificateTemplates).where(eq(certificateTemplates.id, templateId));

        return res.json({ success: true, message: 'Template deleted successfully' });
    } catch (error: any) {
        console.error('[DELETE TEMPLATE ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to delete template', error: error.message });
    }
}

// ============================================
// ADMIN: Set default template
// ============================================
export async function setDefaultTemplate(req: Request, res: Response): Promise<Response> {
    try {
        const templateId = Number(req.params.id);

        const [existing] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, templateId)).limit(1);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        // Unset all defaults
        await db.update(certificateTemplates)
            .set({ isDefault: false })
            .where(eq(certificateTemplates.isDefault, true));

        // Set this one as default
        await db.update(certificateTemplates)
            .set({ isDefault: true })
            .where(eq(certificateTemplates.id, templateId));

        return res.json({ success: true, message: 'Template set as default' });
    } catch (error: any) {
        console.error('[SET DEFAULT TEMPLATE ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to set default template', error: error.message });
    }
}

// ============================================
// ADMIN: List all certificates
// ============================================
export async function getAllCertificates(req: Request, res: Response): Promise<Response> {
    try {
        const allCerts = await db
            .select({
                id: certificates.id,
                certificateId: certificates.certificateId,
                userId: certificates.userId,
                userName: certificates.userName,
                type: certificates.type,
                itemName: certificates.itemName,
                completionDate: certificates.completionDate,
                pdfUrl: certificates.pdfUrl,
                createdAt: certificates.createdAt,
            })
            .from(certificates)
            .orderBy(desc(certificates.createdAt));

        return res.json({ success: true, count: allCerts.length, certificates: allCerts });
    } catch (error: any) {
        console.error('[GET ALL CERTIFICATES ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch certificates', error: error.message });
    }
}

// ============================================
// USER: Get my certificates
// ============================================
export async function getUserCertificates(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).userId;

        const userCerts = await db
            .select()
            .from(certificates)
            .where(eq(certificates.userId, userId))
            .orderBy(desc(certificates.createdAt));

        return res.json({ success: true, count: userCerts.length, certificates: userCerts });
    } catch (error: any) {
        console.error('[GET USER CERTIFICATES ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch certificates', error: error.message });
    }
}

// ============================================
// USER: Get certificate by ID
// ============================================
export async function getCertificateById(req: Request, res: Response): Promise<Response> {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const certId = req.params.id;

        const [cert] = await db
            .select()
            .from(certificates)
            .where(eq(certificates.certificateId, certId))
            .limit(1);

        if (!cert) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        // Users can only view their own certificates unless admin
        if (userRole !== 'admin' && cert.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        return res.json({ success: true, certificate: cert });
    } catch (error: any) {
        console.error('[GET CERTIFICATE ERROR]', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch certificate', error: error.message });
    }
}

// ============================================
// USER: Download certificate PDF
// ============================================
export async function downloadCertificate(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const certId = req.params.id;

        const [cert] = await db
            .select()
            .from(certificates)
            .where(eq(certificates.certificateId, certId))
            .limit(1);

        if (!cert) {
            res.status(404).json({ success: false, message: 'Certificate not found' });
            return;
        }

        if (userRole !== 'admin' && cert.userId !== userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        if (!cert.pdfUrl) {
            res.status(404).json({ success: false, message: 'Certificate PDF not found' });
            return;
        }

        const filePath = path.join(__dirname, '../../', cert.pdfUrl);
        if (!fs.existsSync(filePath)) {
            // Regenerate if file missing
            const pdfUrl = await generateCertificatePDF({
                certificateId: cert.certificateId,
                userName: cert.userName,
                itemName: cert.itemName,
                achievementText: cert.achievementText || '',
                completionDate: cert.completionDate,
            });

            // Update DB
            await db.update(certificates)
                .set({ pdfUrl })
                .where(eq(certificates.id, cert.id));

            const newFilePath = path.join(__dirname, '../../', pdfUrl);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${cert.certificateId}.pdf"`);
            fs.createReadStream(newFilePath).pipe(res);
            return;
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${cert.certificateId}.pdf"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (error: any) {
        console.error('[DOWNLOAD CERTIFICATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Failed to download certificate', error: error.message });
    }
}
