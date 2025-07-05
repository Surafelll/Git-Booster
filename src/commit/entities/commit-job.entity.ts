import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CommitLog } from './commit-log.entity';

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity('commit_jobs')
export class CommitJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  repoName: string;

  @Column()
  repoOwner: string;

  @Column()
  repoUrl: string;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('int')
  commitsPerDay: number;

  @Column('simple-array', { nullable: true })
  commitMessages: string[];

  @Column({
    type: 'varchar',
    enum: JobStatus,
    default: JobStatus.PENDING
  })
  status: JobStatus;

  @Column({ nullable: true })
  errorMessage: string;

  @Column('int', { default: 0 })
  totalCommits: number;

  @Column('int', { default: 0 })
  completedCommits: number;

  @Column({ nullable: true })
  lastCommitAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.commitJobs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CommitLog, (commitLog) => commitLog.commitJob)
  commitLogs: CommitLog[];
}