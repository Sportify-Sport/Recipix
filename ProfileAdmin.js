document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".toggle-button");
    const sections = document.querySelectorAll(".profile-page section");

    // Function to show the selected section
    const showSection = (sectionClass) => {
        sections.forEach(section => {
            section.classList.remove("active-section");
            if (section.classList.contains(sectionClass)) {
                section.classList.add("active-section");
            }
        });
    };

    // Event listener for buttons
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const sectionClass = button.getAttribute("data-section");
            showSection(sectionClass);
        });
    });

    // Show "Profile Details" by default
    showSection("profile-details");
});
