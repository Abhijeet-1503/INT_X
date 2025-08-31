// Database setup utilities for SmartProctor-X

import { supabase } from './supabase';

export class DatabaseSetup {
  // Check if tables exist
  static async checkTablesExist(): Promise<{[key: string]: boolean}> {
    const tables = ['user_profiles', 'proctor_sessions', 'violations'];
    const results: {[key: string]: boolean} = {};

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        results[table] = !error || !error.message?.includes('does not exist');
      } catch (error) {
        results[table] = false;
      }
    }

    return results;
  }

  // Initialize basic data if tables exist but are empty
  static async initializeSampleData(): Promise<void> {
    try {
      // Check if we already have data
      const { data: existingUsers } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        console.log('Sample data already exists');
        return;
      }

      // Insert sample user profiles
      const { error: userError } = await supabase
        .from('user_profiles')
        .insert([
          {
            email: 'admin@smartproctor.com',
            role: 'admin',
            display_name: 'System Administrator'
          },
          {
            email: 'proctor@smartproctor.com',
            role: 'proctor',
            display_name: 'Senior Proctor'
          },
          {
            email: 'demo@smartproctor.com',
            role: 'student',
            display_name: 'Demo User'
          }
        ]);

      if (userError) {
        console.warn('Failed to insert sample users:', userError.message);
      } else {
        console.log('Sample users created successfully');
      }

    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }

  // Test database connection
  static async testConnection(): Promise<{success: boolean, message: string}> {
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);

      if (error) {
        if (error.message?.includes('does not exist')) {
          return {
            success: false,
            message: 'Tables not found - run supabase_setup.sql in your Supabase SQL Editor'
          };
        } else if (error.message?.includes('JWT')) {
          return {
            success: false,
            message: 'Authentication failed - check your Supabase API key'
          };
        } else {
          return {
            success: false,
            message: `Database error: ${error.message}`
          };
        }
      }

      return {
        success: true,
        message: 'Database connection successful'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Connection failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  // Get database status
  static async getStatus(): Promise<{
    connection: boolean;
    tables: {[key: string]: boolean};
    sampleData: boolean;
  }> {
    const tables = await this.checkTablesExist();
    const connectionTest = await this.testConnection();

    let sampleDataExists = false;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      sampleDataExists = data && data.length > 0;
    } catch (error) {
      sampleDataExists = false;
    }

    return {
      connection: connectionTest.success,
      tables,
      sampleData: sampleDataExists
    };
  }
}

// Export a function to run setup checks
export const runDatabaseSetup = async (): Promise<void> => {
  console.log('Running database setup checks...');

  const status = await DatabaseSetup.getStatus();

  console.log('Database status:', status);

  if (status.connection) {
    console.log('✅ Database connection successful');

    // Initialize sample data if needed
    await DatabaseSetup.initializeSampleData();
  } else {
    console.warn('❌ Database connection failed');
    console.log('Please run the supabase_setup.sql script in your Supabase dashboard');
  }
};
