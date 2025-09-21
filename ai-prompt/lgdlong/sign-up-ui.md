# Prompt

write layout nextjs shadcn for sign-up, pnpm,

```
export default function SignupPage() {
  return (
    <>
      <h1>Hello</h1>
    </>
  );
}
```

take the entity and dto from backend:

```
import { IsEmail, IsOptional, IsPhoneNumber, IsNotEmpty, MinLength } from 'class-validator';
import { AtLeastOne } from '../../../core/decorators/at-least-one.decorator';

export class CreateAccountDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @AtLeastOne(['email', 'phone'], {
    message: 'Either email or phone must be provided',
  })
  email?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Phone number must be valid' })
  phone?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;
}

// apps/api/src/modules/accounts/entities/account.entity.ts
import { AccountStatus } from '../../../shared/enums/account-status.enum';
import { AccountRole } from '../../../shared/enums/account-role.enum';
import {
Column,
CreateDateColumn,
Entity,
PrimaryGeneratedColumn,
UpdateDateColumn,
Check,
} from 'typeorm';

@Check(`("email" IS NOT NULL OR "phone" IS NOT NULL)`)
@Entity({ name: 'accounts' })
export class Account {
@PrimaryGeneratedColumn()
id!: number;

@Column({ type: 'varchar', length: 120, unique: true, nullable: true })
email!: string | null;

@Column({ type: 'varchar', length: 10, unique: true, nullable: true })
phone!: string | null;

@Column({ name: 'password_hashed', type: 'varchar', length: 255 })
passwordHashed!: string;

@Column({ name: 'full_name', type: 'varchar', length: 120 })
fullName!: string;

@Column({ name: 'avatar_url', type: 'text', nullable: true })
avatarUrl!: string | null;

@Column({
type: 'enum',
enum: AccountStatus,
default: AccountStatus.ACTIVE,
})
status!: AccountStatus;

@Column({
type: 'enum',
enum: AccountRole,
default: AccountRole.USER,
})
role!: AccountRole;

@CreateDateColumn({ name: 'created_at' })
createdAt!: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt!: Date;
}
```

# Chat (Claude Sonnet 4)

https://claude.ai/public/artifacts/b4a64c7d-244a-4e58-b06e-96b09948b69d

```
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Phone, User, Lock } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

// Vietnamese phone number regex pattern
const vietnamesePhoneRegex = /^(\+84|84|0)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;

// Validation schema based on your DTO
const signupSchema = z.object({
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Email must be a valid email address',
    }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || vietnamesePhoneRegex.test(val), {
      message: 'Phone number must be valid',
    }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(1, 'Full name is required'),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Either email or phone must be provided',
    path: ['email'], // Show error on email field
  }
);

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);

    try {
      // Create the payload based on active tab
      const payload = {
        fullName: data.fullName,
        password: data.password,
        ...(activeTab === 'email'
          ? { email: data.email }
          : { phone: data.phone }
        ),
      };

      console.log('Signup payload:', payload);

      // TODO: Implement API call
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Handle success - redirect to login or dashboard
      console.log('Account created successfully');

    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'email' | 'phone') => {
    setActiveTab(tab);
    // Clear the inactive field
    if (tab === 'email') {
      form.setValue('phone', '');
      form.clearErrors('phone');
    } else {
      form.setValue('email', '');
      form.clearErrors('email');
    }
    form.clearErrors('email'); // Clear the "either email or phone" error
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleTabChange('email')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('phone')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'phone'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="h-4 w-4" />
              Phone
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email/Phone Field */}
              {activeTab === 'email' ? (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          autoComplete="new-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="space-y-4">
            <Separator />
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

I'll create a modern, responsive sign-up page using Next.js and shadcn/ui components based on your backend DTO structure. This will include proper form validation and a clean design.I've created a comprehensive sign-up page that matches your backend DTO structure. Here are the key features:

## Key Features

**Form Validation:**

- Matches your `CreateAccountDto` validation rules
- Vietnamese phone number validation
- Email validation
- Password minimum 6 characters
- Required full name
- Either email OR phone must be provided

**UI/UX:**

- Toggle between email and phone registration
- Password visibility toggle
- Loading states
- Responsive design
- Modern glassmorphism-inspired styling

**Technical Details:**

- Uses React Hook Form with Zod validation
- TypeScript for type safety
- shadcn/ui components
- Proper form accessibility
- Auto-complete attributes

## Required Dependencies

Install these packages with pnpm:

```bash
pnpm add react-hook-form @hookform/resolvers zod lucide-react
```

## shadcn/ui Components Needed

Add these shadcn/ui components:

```bash
npx shadcn-ui@latest add button card form input separator
```

## File Structure

Place this in `app/auth/signup/page.tsx` or your preferred route structure.

The form automatically switches between email and phone input based on the selected tab, and the validation ensures that at least one contact method is provided, exactly matching your backend DTO requirements.
