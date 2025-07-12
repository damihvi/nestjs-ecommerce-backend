import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileType } from './file.entity';
import { CreateFileDto, FileQueryDto } from './dto/file.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async uploadFile(file: Express.Multer.File, uploadedBy?: string): Promise<File> {
    const fileType = this.getFileType(file.mimetype);
    
    const createFileDto: CreateFileDto = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      type: fileType,
      url: `/uploads/${file.filename}`,
      uploadedBy,
    };

    const newFile = this.fileRepository.create(createFileDto);
    return await this.fileRepository.save(newFile);
  }

  async uploadMultipleFiles(files: Express.Multer.File[], uploadedBy?: string): Promise<File[]> {
    const uploadedFiles: File[] = [];
    
    for (const file of files) {
      const uploadedFile = await this.uploadFile(file, uploadedBy);
      uploadedFiles.push(uploadedFile);
    }
    
    return uploadedFiles;
  }

  async findAll(query: FileQueryDto): Promise<Pagination<File>> {
    const queryBuilder = this.fileRepository.createQueryBuilder('file')
      .leftJoinAndSelect('file.uploader', 'uploader')
      .orderBy('file.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('file.type = :type', { type: query.type });
    }

    if (query.uploadedBy) {
      queryBuilder.andWhere('file.uploadedBy = :uploadedBy', { uploadedBy: query.uploadedBy });
    }

    return paginate<File>(queryBuilder, {
      page: query.page || 1,
      limit: query.limit || 20,
    });
  }

  async findOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);
    
    // Eliminar el archivo físico
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    await this.fileRepository.remove(file);
  }

  async getFileStats(): Promise<any> {
    const totalFiles = await this.fileRepository.count();
    const totalSize = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'totalSize')
      .getRawOne();

    const filesByType = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(file.size)', 'totalSize')
      .groupBy('file.type')
      .getRawMany();

    return {
      totalFiles,
      totalSize: parseInt(totalSize.totalSize) || 0,
      filesByType,
    };
  }

  private getFileType(mimetype: string): FileType {
    if (mimetype.startsWith('image/')) return FileType.IMAGE;
    if (mimetype.startsWith('video/')) return FileType.VIDEO;
    if (mimetype.startsWith('audio/')) return FileType.AUDIO;
    if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }

  async validateFile(file: Express.Multer.File): Promise<void> {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'video/mp4',
      'audio/mpeg',
    ];

    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }
  }
}
