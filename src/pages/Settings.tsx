import { type ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGetProfile } from '@/hooks/useGetProfile'
import { changePassword, updateProfile } from '@/services/user'
import { queryKeys } from '@/constants/query-keys'

const profileSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'New passwords do not match',
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function Settings() {
  const { profileQuery } = useGetProfile()
  const queryClient = useQueryClient()

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  useEffect(() => {
    if (profileQuery.data?.data) {
      profileForm.reset({
        name: profileQuery.data.data.name || '',
        email: profileQuery.data.data.email || '',
      })
    }
  }, [profileForm, profileQuery.data?.data])

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  const profile = profileQuery.data?.data
  const profileImagePreview =
    localPreviewUrl ?? profile?.profile_image

  const profileName = profile?.name?.trim() || profile?.email || 'User'
  const profileInitials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0].toUpperCase())
    .join('') || 'U'

  const updateProfileMutation = useMutation({
    mutationFn: (payload: { name: string; profile_image?: File | null }) =>
      updateProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.profile] })
      setProfileImageFile(null)
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
        setLocalPreviewUrl(null)
      }
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      changePassword(payload),
    onSuccess: () => {
      passwordForm.reset()
    },
  })

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl)
    }

    const previewUrl = URL.createObjectURL(file)
    setProfileImageFile(file)
    setLocalPreviewUrl(previewUrl)
  }

  const handleProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      name: profile?.name ?? values.name,
      profile_image: profileImageFile,
    })
  }

  const handlePasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Update your account details, change your profile photo, and manage your password separately.
        </p>
      </div>

      {profileQuery.isLoading ? (
        <div className="rounded-3xl border bg-card p-6 shadow-soft">Loading profile...</div>
      ) : profileQuery.isError ? (
        <div className="rounded-3xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
          Failed to load profile. Please refresh the page.
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 p-6 shadow-soft">
            <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-indigo-100 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Profile details</h2>
                  <p className="mt-1 text-muted-foreground">
                    Update your profile picture. Name and email are read-only here.
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  Personal settings
                </div>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[150px_1fr] lg:items-start">
                <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-indigo-200 bg-white p-5 text-center shadow-sm">
                  <Avatar size="lg" className="bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-500 text-white shadow-lg">
                    {profileImagePreview ? (
                      <AvatarImage src={profileImagePreview} alt="Profile preview" />
                    ) : (
                      <AvatarFallback className="text-white">
                        {profileInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Profile photo</Label>
                      <p className="text-sm text-muted-foreground">Upload a square image that represents you.</p>
                    </div>
                    <label
                      htmlFor="profile-image"
                      className="inline-flex cursor-pointer items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      Choose file
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        className="h-12 rounded-xl bg-slate-50"
                        placeholder="Jane Doe"
                        readOnly
                        {...profileForm.register('name')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        className="h-12 rounded-xl bg-slate-50"
                        placeholder="jane@company.com"
                        readOnly
                        {...profileForm.register('email')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-3xl border border-indigo-200 bg-indigo-50/80 p-4">
                    <p className="text-sm text-indigo-700">Role</p>
                    <div className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800 shadow-sm">
                      {profile?.role ? profile.role.replace(/([A-Z])/g, ' $1').trim() : 'Member'}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Name and email can only be viewed here. To change them, contact support or your account administrator.
                  </p>
                </div>
              </div>

              {updateProfileMutation.isError && (
                <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {updateProfileMutation.error instanceof Error
                    ? updateProfileMutation.error.message
                    : 'Unable to save profile. Please try again.'}
                </div>
              )}

              {updateProfileMutation.isSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-100 p-4 text-sm text-emerald-700">
                  Your profile was updated successfully.
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={updateProfileMutation.isPending || !profileImageFile}>
                  {updateProfileMutation.isPending ? 'Uploading...' : 'Upload photo'}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-slate-100 p-6 shadow-soft">
            <div className="mb-6 flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">Password</h2>
              <p className="text-muted-foreground">Change your password independently from your profile settings.</p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="h-12 rounded-xl"
                    {...passwordForm.register('currentPassword')}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="h-12 rounded-xl"
                    {...passwordForm.register('newPassword')}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    className="h-12 rounded-xl"
                    {...passwordForm.register('confirmNewPassword')}
                  />
                  {passwordForm.formState.errors.confirmNewPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {changePasswordMutation.isError && (
                <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {changePasswordMutation.error instanceof Error
                    ? changePasswordMutation.error.message
                    : 'Unable to update password. Please try again.'}
                </div>
              )}

              {changePasswordMutation.isSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-100 p-4 text-sm text-emerald-700">
                  Password updated successfully.
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? 'Updating...' : 'Change password'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
