import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionsService } from '../permissions.service';

/**
 * Automatically seeds default permissions when the app starts
 * This ensures permissions exist in the database before users try to register
 */
@Injectable()
export class PermissionSeeder implements OnModuleInit {
  constructor(private readonly permissionsService: PermissionsService) {}

  async onModuleInit() {
    console.log('🌱 [PERMISSION-SEEDER] Checking if permissions need to be seeded...');
    
    try {
      const existingPermissions = await this.permissionsService.getAllPermissions();
      
      if (existingPermissions && existingPermissions.length > 0) {
        console.log(`✅ [PERMISSION-SEEDER] Permissions already exist (${existingPermissions.length} found). Skipping seed.`);
        return;
      }
      
      console.log('🌱 [PERMISSION-SEEDER] No permissions found. Starting seed process...');
      await this.permissionsService.seedDefaultPermissions();
      console.log('✅ [PERMISSION-SEEDER] Permissions seeded successfully!');
    } catch (error) {
      console.error('❌ [PERMISSION-SEEDER] Failed to seed permissions:', error instanceof Error ? error.message : String(error));
      // Don't throw - allow app to start even if seeding fails
      // Users can manually seed via the /api/permissions/seed endpoint
    }
  }
}
