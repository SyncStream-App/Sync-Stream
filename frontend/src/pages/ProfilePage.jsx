// frontend/src/pages/ProfilePage.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()

  const { token, user, setUser } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [followersOpen, setFollowersOpen] = useState(false)
  const [followingOpen, setFollowingOpen] = useState(false)

  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])

  const [avatarFile, setAvatarFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)

  const [usernameAvailable, setUsernameAvailable] = useState(null)

  const [form, setForm] = useState({
    username: '',
    bio: '',
    display_name: '',
  })

  const isOwnProfile = user?.id === profile?.id

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error('User not found')
      }

      const data = await res.json()

      setProfile(data.user)
      setPosts(data.posts || [])

      setForm({
        username: data.user.username || '',
        bio: data.user.bio || '',
        display_name: data.user.display_name || '',
      })

    } catch (err) {
      console.error(err)
      toast.error('Failed to load following')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isEditing) return
    if (!profile) return

    if (form.username === profile.username) {
      setUsernameAvailable(true)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/users/check-username?username=${form.username}`
        )

        const data = await res.json()

        setUsernameAvailable(data.available)
      } catch {
        setUsernameAvailable(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [form.username, isEditing, profile])

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()

    formData.append('file', file)
    formData.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_AVATAR_PRESET
    )

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!res.ok) {
      throw new Error('Upload failed')
    }

    const data = await res.json()

    return data.secure_url
  }

  const handleAvatarChange = (file) => {
    if (!file) return

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleBannerChange = (file) => {
    if (!file) return

    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleUpdateProfile = async () => {
    try {
      setSaving(true)

      if (
        form.username !== profile.username &&
        usernameAvailable === false
      ) {
        toast.error('Username already taken')
        return
      }

      let avatar_url = profile.avatar_url
      let banner_url = profile.banner_url

      if (avatarFile) {
        avatar_url = await uploadToCloudinary(avatarFile)
      }

      if (bannerFile) {
        banner_url = await uploadToCloudinary(bannerFile)
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: form.username,
            bio: form.bio,
            display_name: form.display_name,
            avatar_url,
            banner_url,
          }),
        }
      )

      if (!res.ok) {
        throw new Error('Update failed')
      }

      const data = await res.json()

      setProfile(data.user)

      setUser({
        ...user,
        ...data.user,
      })

      toast.success('Profile updated successfully')

      setIsEditing(false)

      setAvatarFile(null)
      setBannerFile(null)

      setAvatarPreview(null)
      setBannerPreview(null)

      if (form.username !== username) {
        navigate(`/profile/${data.user.username}`, {
          replace: true,
        })
      }

    } catch (err) {
      console.error(err)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleFollow = async () => {
    try {
      const currentlyFollowing = profile.is_following

      setProfile((prev) => ({
        ...prev,
        is_following: !currentlyFollowing,
        followers_count: currentlyFollowing
          ? prev.followers_count - 1
          : prev.followers_count + 1,
      }))

      const endpoint = currentlyFollowing
        ? 'DELETE'
        : 'POST'

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${profile.id}/follow`,
        {
          method: endpoint,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      toast.success(
        currentlyFollowing ? 'Unfollowed user' : 'Started following'
      )

    } catch {
      fetchProfile()
      toast.error('Failed to load followers')
    }
  }

  const fetchFollowers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${profile.id}/followers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      setFollowers(data)
      setFollowersOpen(true)

    } catch (err) {
      console.error(err)
      toast.error('Failed to load following')
    }
  }

  const fetchFollowing = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${profile.id}/following`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      setFollowing(data)
      setFollowingOpen(true)

    } catch (err) {
      console.error(err)
      toast.error('Failed to load following')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="w-12 h-12 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center mt-20 text-red-400">
        User not found
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* BANNER */}
      <div className="relative h-56 rounded-3xl overflow-hidden bg-gray-200 dark:bg-white/10">
        <img
          src={
            bannerPreview ||
            profile.banner_url ||
            'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop'
          }
          className="w-full h-full object-cover"
        />

        <div className="absolute -bottom-14 left-6">
          <img
            src={
              avatarPreview ||
              profile.avatar_url ||
              `https://ui-avatars.com/api/?name=${profile.username}`
            }
            className="w-28 h-28 rounded-full border-4 border-white dark:border-black object-cover"
          />
        </div>
      </div>

      {/* PROFILE */}
      <div className="mt-20 bg-gray-100 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-white/10">

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

          <div>
            <h1 className="text-3xl font-bold">
              {profile.display_name || profile.username}
            </h1>

            <p className="text-gray-500">
              @{profile.username}
            </p>

            <p className="mt-4 whitespace-pre-wrap">
              {profile.bio || 'No bio yet'}
            </p>

            {/* STATS */}
            <div className="flex gap-6 mt-5 text-sm">

              <button onClick={fetchFollowers}>
                <span className="font-bold">
                  {profile.followers_count || 0}
                </span>{' '}
                Followers
              </button>

              <button onClick={fetchFollowing}>
                <span className="font-bold">
                  {profile.following_count || 0}
                </span>{' '}
                Following
              </button>

              <div>
                <span className="font-bold">
                  {profile.posts_count || 0}
                </span>{' '}
                Posts
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">

            {!isOwnProfile && (
              <>
                <button
                  onClick={handleFollow}
                  className={`px-5 py-2 rounded-xl text-white ${
                    profile.is_following
                      ? 'bg-gray-500'
                      : 'bg-brand-purple'
                  }`}
                >
                  {profile.is_following
                    ? 'Following'
                    : 'Follow'}
                </button>

                <button
                  onClick={() => navigate('/messages')}
                  className="px-5 py-2 rounded-xl bg-gray-300 dark:bg-white/10"
                >
                  Message
                </button>
              </>
            )}

            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-xl bg-brand-purple text-white"
              >
                Edit Profile
              </button>
            )}

          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="mt-8">

        <h2 className="text-2xl font-bold mb-5">
          Posts
        </h2>

        {posts.length === 0 ? (
          <div className="text-gray-500">
            No posts yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl overflow-hidden
                bg-gray-100 dark:bg-white/5
                border border-gray-200 dark:border-white/10"
              >

                {post.image_url && (
                  <img
                    src={post.image_url}
                    className="w-full h-72 object-cover"
                  />
                )}

                <div className="p-4">

                  <div className="flex items-center gap-3 mb-3">

                    <img
                      src={
                        post.user?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${post.user?.username}`
                      }
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <div>
                      <p className="font-semibold">
                        {post.user?.username}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <div className="flex gap-5 mt-4 text-sm text-gray-500">

                    <div>
                      ❤️ {post.likes_count || 0}
                    </div>

                    <div>
                      💬 {post.comments_count || 0}
                    </div>

                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditing(false)
            }
          }}
        >

          <div className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-brand-dark">

            <h2 className="text-2xl font-bold mb-5">
              Edit Profile
            </h2>

            <div className="space-y-4">

              <div>
                <p className="mb-2 text-sm">Avatar</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleAvatarChange(e.target.files[0])
                  }
                />
              </div>

              <div>
                <p className="mb-2 text-sm">Banner</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleBannerChange(e.target.files[0])
                  }
                />
              </div>

              <input
                value={form.display_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    display_name: e.target.value,
                  })
                }
                placeholder="Display name"
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/10"
              />

              <div>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value,
                    })
                  }
                  placeholder="Username"
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/10"
                />

                {usernameAvailable === true && (
                  <p className="text-green-500 text-sm mt-1">
                    Username available
                  </p>
                )}

                {usernameAvailable === false && (
                  <p className="text-red-500 text-sm mt-1">
                    Username taken
                  </p>
                )}
              </div>

              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bio: e.target.value,
                  })
                }
                placeholder="Bio"
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/10"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-gray-300 dark:bg-white/10"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={handleUpdateProfile}
                className="px-5 py-2 rounded-xl bg-brand-purple text-white"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* FOLLOWERS MODAL */}
      {followersOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFollowersOpen(false)
            }
          }}
        >
          <div className="bg-white dark:bg-brand-dark rounded-3xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">
                Followers
              </h2>

              <button onClick={() => setFollowersOpen(false)}>
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">

              {followers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-3">

                    <img
                      src={
                        item.avatar_url ||
                        `https://ui-avatars.com/api/?name=${item.username}`
                      }
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div>
                      <p className="font-semibold">
                        {item.username}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.bio || 'No bio'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/profile/${item.username}`)
                    }
                    className="text-brand-purple"
                  >
                    View
                  </button>

                </div>
              ))}

            </div>
          </div>
        </div>
      )}

      {/* FOLLOWING MODAL */}
      {followingOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFollowingOpen(false)
            }
          }}
        >
          <div className="bg-white dark:bg-brand-dark rounded-3xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">
                Following
              </h2>

              <button onClick={() => setFollowingOpen(false)}>
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">

              {following.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-3">

                    <img
                      src={
                        item.avatar_url ||
                        `https://ui-avatars.com/api/?name=${item.username}`
                      }
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div>
                      <p className="font-semibold">
                        {item.username}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.bio || 'No bio'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/profile/${item.username}`)
                    }
                    className="text-brand-purple"
                  >
                    View
                  </button>

                </div>
              ))}

            </div>
          </div>
        </div>
      )}

    </div>
  )
}