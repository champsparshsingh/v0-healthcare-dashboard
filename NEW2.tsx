const checkAndAlert = (systolic, diastolic) => {
  // 1. Get the latest family list from storage
  const savedMembers = JSON.parse(localStorage.getItem('familyContacts') || "[]");

  // 2. Check the threshold
  if (systolic > 150 || diastolic > 95) {
    if (savedMembers.length > 0) {
      const names = savedMembers.map(m => m.name).join(", ");
      alert(`⚠️ CRITICAL BP: ${systolic}/${diastolic}\n\nNotifications sent to: ${names}`);
    } else {
      alert(`⚠️ CRITICAL BP: ${systolic}/${diastolic}\n(No family members added to notify!)`);
    }
  }
};