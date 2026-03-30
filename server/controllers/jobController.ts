// server/controllers/jobController.ts
import { Request, Response } from 'express';
import { invalidateCache } from '../middleware/cacheMiddleware';
import { db } from '../config/db';
import { jobs } from '../../shared/schema';
import { eq, desc, like, or, and, sql } from 'drizzle-orm';

// ============================================
// GET ALL JOBS (Public - with filters)
// ============================================
export const getAllJobs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { search, state, status, organization } = req.query;

    let conditions: any[] = [];

    // Filter by status (default: active)
    if (status) {
      conditions.push(eq(jobs.status, status as string));
    } else {
      conditions.push(eq(jobs.status, 'active'));
    }

    // Search filter
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(jobs.title, searchTerm),
          like(jobs.organization, searchTerm),
          like(jobs.department, searchTerm),
          like(jobs.location, searchTerm)
        )
      );
    }

    // State filter
    if (state) {
      conditions.push(eq(jobs.state, state as string));
    }

    // Organization filter
    if (organization) {
      conditions.push(eq(jobs.organization, organization as string));
    }

    const allJobs = await db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt));

    return res.json({
      success: true,
      count: allJobs.length,
      jobs: allJobs,
    });
  } catch (error: any) {
    console.error('[GET ALL JOBS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
    });
  }
};

// ============================================
// GET JOB BY ID (Public)
// ============================================
export const getJobById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const jobId = Number(req.params.id);

    if (isNaN(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment views
    await db
      .update(jobs)
      .set({ views: sql`${jobs.views} + 1` })
      .where(eq(jobs.id, jobId));

    return res.json({
      success: true,
      job,
    });
  } catch (error: any) {
    console.error('[GET JOB BY ID ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
    });
  }
};

// ============================================
// CREATE JOB (Admin only)
// ============================================
export const createJob = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;

    if (!['admin'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create jobs',
      });
    }

    const {
      title,
      organization,
      department,
      location,
      state,
      positions,
      qualifications,
      experience,
      salary,
      ageLimit,
      applicationFee,
      description,
      responsibilities,
      requirements,
      benefits,
      applyUrl,
      lastDate,
      examDate,
      status,
    } = req.body;

    // Validation
    if (!title || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Title and organization are required',
      });
    }

    const [result] = await db.insert(jobs).values({
      title,
      organization,
      department: department || null,
      location: location || null,
      state: state || null,
      positions: positions || null,
      qualifications: qualifications || null,
      experience: experience || null,
      salary: salary || null,
      ageLimit: ageLimit || null,
      applicationFee: applicationFee || null,
      description: description || null,
      responsibilities: responsibilities || null,
      requirements: requirements || null,
      benefits: benefits || null,
      applyUrl: applyUrl || null,
      lastDate: lastDate || null,
      examDate: examDate || null,
      status: status || 'active',
      views: 0,
    });

    await invalidateCache('api_cache:GET:/api/jobs*');
    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      jobId: result.insertId,
    });
  } catch (error: any) {
    console.error('[CREATE JOB ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create job',
    });
  }
};

// ============================================
// UPDATE JOB (Admin only)
// ============================================
export const updateJob = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;
    const jobId = Number(req.params.id);

    if (!['admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const updateData: any = { ...req.body };
    delete updateData.id;
    delete updateData.views;
    delete updateData.createdAt;

    await db.update(jobs).set(updateData).where(eq(jobs.id, jobId));

    await invalidateCache('api_cache:GET:/api/jobs*');
    return res.json({ success: true, message: 'Job updated successfully' });
  } catch (error: any) {
    console.error('[UPDATE JOB ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job',
    });
  }
};

// ============================================
// DELETE JOB (Admin only)
// ============================================
export const deleteJob = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;
    const jobId = Number(req.params.id);

    if (!['admin'].includes(user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await db.delete(jobs).where(eq(jobs.id, jobId));

    await invalidateCache('api_cache:GET:/api/jobs*');
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE JOB ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete job',
    });
  }
};

// ============================================
// GET UNIQUE STATES (for filter dropdown)
// ============================================
export const getStates = async (req: Request, res: Response): Promise<Response> => {
  try {
    const states = await db
      .selectDistinct({ state: jobs.state })
      .from(jobs)
      .where(eq(jobs.status, 'active'));

    const stateList = states
      .map((s) => s.state)
      .filter((s) => s !== null)
      .sort();

    return res.json({
      success: true,
      states: stateList,
    });
  } catch (error: any) {
    console.error('[GET STATES ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch states',
    });
  }
};

// ============================================
// GET UNIQUE ORGANIZATIONS (for filter dropdown)
// ============================================
export const getOrganizations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const orgs = await db
      .selectDistinct({ organization: jobs.organization })
      .from(jobs)
      .where(eq(jobs.status, 'active'));

    const orgList = orgs
      .map((o) => o.organization)
      .filter((o) => o !== null)
      .sort();

    return res.json({
      success: true,
      organizations: orgList,
    });
  } catch (error: any) {
    console.error('[GET ORGANIZATIONS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
    });
  }
};
