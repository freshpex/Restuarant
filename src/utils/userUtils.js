export const getSerializableUser = (firebaseUser) => {
    if (!firebaseUser) return null;
    
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        lastLoginAt: firebaseUser.metadata?.lastLoginAt || null,
        createdAt: firebaseUser.metadata?.createdAt || null
    };
};

export const isUserDataValid = (userData) => {
    return userData && 
           typeof userData === 'object' && 
           'uid' in userData && 
           'email' in userData;
};

export const getDefaultAvatar = (displayName) => {
  if (!displayName) return 'https://via.placeholder.com/150?text=User';
  
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const getColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  const color = getColor(displayName);
  const backgroundColor = encodeURIComponent(color);
  const textColor = 'ffffff';
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=${textColor}`;
};
