{showLocationPicker && (
  <LocationPickerModal
    initialValue={form.Location}
    onSelect={({ location }) => {
      setForm(prev => ({ ...prev, Location: location }));
      if (error) setError('');
    }}
    onClose={() => setShowLocationPicker(false)}
  />
)}