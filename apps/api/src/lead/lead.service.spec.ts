import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadEntity } from './entities/lead.entity';

describe('LeadService', () => {
  let service: LeadService;
  let mockRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    findOneBy: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn((dto) => ({ id: 'test-uuid', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'test-uuid' })),
      findAndCount: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: getRepositoryToken(LeadEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LeadService>(LeadService);
  });

  const validLeadDto = {
    vorname: 'Max',
    nachname: 'Mustermann',
    email: 'max@behoerde.de',
    organisation: 'Stadtverwaltung Berlin',
    typ: 'KONTAKT',
    datenschutzAkzeptiert: true,
  };

  describe('createLead', () => {
    it('should create a lead with valid data', async () => {
      const result = await service.createLead(validLeadDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...validLeadDto,
        ipAdresse: undefined,
        userAgent: undefined,
        status: 'NEU',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('test-uuid');
    });

    it('should reject when datenschutzAkzeptiert is false', async () => {
      const dto = { ...validLeadDto, datenschutzAkzeptiert: false };

      await expect(service.createLead(dto)).rejects.toThrow(BadRequestException);
      await expect(service.createLead(dto)).rejects.toThrow(
        'Datenschutzbestimmungen müssen akzeptiert werden',
      );
    });

    it('should capture IP address and User-Agent', async () => {
      const ip = '192.168.1.1';
      const ua = 'Mozilla/5.0';

      await service.createLead(validLeadDto, ip, ua);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAdresse: ip,
          userAgent: ua,
        }),
      );
    });

    it('should set default status to NEU', async () => {
      await service.createLead(validLeadDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'NEU',
        }),
      );
    });
  });

  describe('findAllLeads', () => {
    it('should return paginated leads', async () => {
      const leads = [
        { id: '1', ...validLeadDto, status: 'NEU', erstelltAm: new Date() },
        { id: '2', ...validLeadDto, status: 'NEU', erstelltAm: new Date() },
      ];
      mockRepository.findAndCount.mockResolvedValue([leads, 2]);

      const result = await service.findAllLeads(1, 20);

      expect(result.leads).toHaveLength(2);
      expect(result.gesamt).toBe(2);
      expect(result.seiten).toBe(1);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { erstelltAm: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should calculate correct pagination', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 45]);

      const result = await service.findAllLeads(2, 20);

      expect(result.seiten).toBe(3);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { erstelltAm: 'DESC' },
        skip: 20,
        take: 20,
      });
    });
  });

  describe('updateLeadStatus', () => {
    it('should update lead status', async () => {
      const lead = { id: 'test-id', ...validLeadDto, status: 'NEU' };
      mockRepository.findOneBy.mockResolvedValue(lead);

      const result = await service.updateLeadStatus('test-id', {
        status: 'KONTAKTIERT',
      });

      expect(result.status).toBe('KONTAKTIERT');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw when lead not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateLeadStatus('non-existent', { status: 'KONTAKTIERT' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLeadStats', () => {
    it('should return aggregated statistics', async () => {
      const leads = [
        { status: 'NEU', typ: 'KONTAKT' },
        { status: 'NEU', typ: 'DEMO' },
        { status: 'KONTAKTIERT', typ: 'KONTAKT' },
        { status: 'QUALIFIZIERT', typ: 'DEMO' },
        { status: 'KONVERTIERT', typ: 'NEWSLETTER' },
      ];
      mockRepository.find.mockResolvedValue(leads);

      const stats = await service.getLeadStats();

      expect(stats.gesamt).toBe(5);
      expect(stats.neu).toBe(2);
      expect(stats.kontaktiert).toBe(1);
      expect(stats.qualifiziert).toBe(1);
      expect(stats.konvertiert).toBe(1);
      expect(stats.nachTyp).toEqual({
        KONTAKT: 2,
        DEMO: 2,
        NEWSLETTER: 1,
      });
    });
  });
});
