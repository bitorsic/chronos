import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { jobService } from '../services/jobService';
import { JobType, ScheduleType } from '../types/job';
import type { CreateJobDto } from '../types/job';

const jobSchema = z.object({
  jobType: z.enum([JobType.EMAIL_REMINDER, JobType.EMAIL_PRICES, JobType.STORE_PRICES]),
  scheduleType: z.enum([ScheduleType.IMMEDIATE, ScheduleType.ONCE, ScheduleType.CRON]),
  scheduledAt: z.string().optional(),
  cronExpression: z.string().optional(),
  recipients: z.string().optional(), // Comma-separated email addresses
  subject: z.string().optional(),
  message: z.string().optional(),
  stockSymbols: z.string().optional(),
}).refine(
  (data) => {
    if (data.scheduleType === ScheduleType.ONCE) {
      return !!data.scheduledAt;
    }
    return true;
  },
  { message: 'Scheduled date/time is required for ONCE schedule', path: ['scheduledAt'] }
).refine(
  (data) => {
    if (data.scheduleType === ScheduleType.CRON) {
      return !!data.cronExpression;
    }
    return true;
  },
  { message: 'Cron expression is required for CRON schedule', path: ['cronExpression'] }
).refine(
  (data) => {
    if (data.jobType === JobType.EMAIL_REMINDER || data.jobType === JobType.EMAIL_PRICES) {
      return !!data.recipients;
    }
    return true;
  },
  { message: 'Recipients are required for email jobs', path: ['recipients'] }
).refine(
  (data) => {
    if (data.jobType === JobType.EMAIL_REMINDER) {
      return !!data.subject && !!data.message;
    }
    return true;
  },
  { message: 'Subject and message are required for EMAIL_REMINDER', path: ['subject'] }
).refine(
  (data) => {
    if (data.jobType === JobType.EMAIL_PRICES || data.jobType === JobType.STORE_PRICES) {
      return !!data.stockSymbols;
    }
    return true;
  },
  { message: 'Stock symbols are required for this job type', path: ['stockSymbols'] }
);

type JobFormData = z.infer<typeof jobSchema>;

export default function CreateJob() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobType: JobType.EMAIL_REMINDER,
      scheduleType: ScheduleType.IMMEDIATE,
    },
  });

  const jobType = watch('jobType');
  const scheduleType = watch('scheduleType');

  const onSubmit = async (formData: JobFormData) => {
    setIsLoading(true);
    try {
      const jobData: CreateJobDto = {
        jobType: formData.jobType,
        schedule: {
          scheduleType: formData.scheduleType,
          ...(formData.scheduleType === ScheduleType.ONCE && {
            scheduledAt: formData.scheduledAt,
          }),
          ...(formData.scheduleType === ScheduleType.CRON && {
            cronExpression: formData.cronExpression,
          }),
        },
        data: {},
      };

      // Add job-specific data
      if (formData.jobType === JobType.EMAIL_REMINDER) {
        jobData.data.to = formData.recipients?.split(',').map((s) => s.trim()).filter(Boolean) || [];
        jobData.data.subject = formData.subject;
        jobData.data.body = formData.message;
      }

      if (formData.jobType === JobType.EMAIL_PRICES) {
        jobData.data.to = formData.recipients?.split(',').map((s) => s.trim()).filter(Boolean) || [];
        jobData.data.symbols = formData.stockSymbols
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (formData.jobType === JobType.STORE_PRICES) {
        const symbols = formData.stockSymbols
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        jobData.data.symbol = symbols?.[0] || '';
      }

      const createdJob = await jobService.createJob(jobData);
      toast.success('Job created successfully!');
      navigate(`/jobs/${createdJob._id}`);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create job'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600 mt-1">Schedule a new automated job</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Type */}
            <Select
              label="Job Type"
              options={[
                { value: JobType.EMAIL_REMINDER, label: 'Email Reminder' },
                { value: JobType.EMAIL_PRICES, label: 'Email Stock Prices' },
                { value: JobType.STORE_PRICES, label: 'Store Stock Prices' },
              ]}
              error={errors.jobType?.message}
              {...register('jobType')}
            />

            {/* Schedule Type */}
            <Select
              label="Schedule Type"
              options={[
                { value: ScheduleType.IMMEDIATE, label: 'Immediate (Run Once Now)' },
                { value: ScheduleType.ONCE, label: 'Once (At Specific Time)' },
                { value: ScheduleType.CRON, label: 'Recurring (Cron Expression)' },
              ]}
              error={errors.scheduleType?.message}
              {...register('scheduleType')}
            />

            {/* Scheduled At (for ONCE) */}
            {scheduleType === ScheduleType.ONCE && (
              <Input
                label="Scheduled Date & Time"
                type="datetime-local"
                error={errors.scheduledAt?.message}
                {...register('scheduledAt')}
              />
            )}

            {/* Cron Expression (for CRON) */}
            {scheduleType === ScheduleType.CRON && (
              <div>
                <Input
                  label="Cron Expression"
                  placeholder="0 9 * * 1-5 (Every weekday at 9 AM)"
                  error={errors.cronExpression?.message}
                  {...register('cronExpression')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: "0 9 * * *" = Every day at 9 AM
                </p>
              </div>
            )}

            {/* Recipients (for EMAIL jobs) */}
            {(jobType === JobType.EMAIL_REMINDER || jobType === JobType.EMAIL_PRICES) && (
              <Input
                label="Recipients"
                placeholder="user1@example.com, user2@example.com"
                error={errors.recipients?.message}
                {...register('recipients')}
              />
            )}

            {/* Email Subject (for EMAIL_REMINDER and EMAIL_PRICES) */}
            {(jobType === JobType.EMAIL_REMINDER || jobType === JobType.EMAIL_PRICES) && (
              <Input
                label="Email Subject"
                placeholder="Your daily reminder"
                error={errors.subject?.message}
                {...register('subject')}
              />
            )}

            {/* Message (for EMAIL_REMINDER only) */}
            {jobType === JobType.EMAIL_REMINDER && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className={`
                    w-full px-3 py-2 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    ${errors.message ? 'border-error' : 'border-gray-300'}
                  `}
                  rows={4}
                  placeholder="Your reminder message..."
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-error">{errors.message.message}</p>
                )}
              </div>
            )}

            {/* Stock Symbols (for EMAIL_PRICES and STORE_PRICES) */}
            {(jobType === JobType.EMAIL_PRICES || jobType === JobType.STORE_PRICES) && (
              <div>
                <Input
                  label="Stock Symbols"
                  placeholder="AAPL, GOOGL, MSFT"
                  error={errors.stockSymbols?.message}
                  {...register('stockSymbols')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter stock symbols separated by commas
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
                Create Job
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/jobs')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Section */}
        <Card title="Job Types Explained">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">Email Reminder</p>
              <p className="text-gray-600">Send a custom email reminder to yourself</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Stock Prices</p>
              <p className="text-gray-600">
                Get stock prices emailed to you for specified symbols
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Store Stock Prices</p>
              <p className="text-gray-600">
                Store stock prices in the database for historical tracking
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
