"use client";

import { IUserProfile, ISessionsData } from "@/app/types/user.types";
import { useProfileManager } from "../hooks/useProfileManager";
import ProfileHeader from "./ProfileHeader";
import ProfileHeroCard from "./ProfileHeroCard";
import ProfileDetailsForm from "./ProfileDetailsForm";
import ProfileSecurityCards from "./ProfileSecurityCards";
import ActiveSessionsSection from "./ActiveSessionsSection";
import PhoneVerificationModal from "./PhoneVerificationModal";

interface ProfileContainerProps {
    initialProfile: IUserProfile | null;
    initialSessions: ISessionsData | null;
}

export default function ProfileContainer({
    initialProfile,
    initialSessions,
}: ProfileContainerProps) {
    const {
        profile,
        name,
        setName,
        address,
        setAddress,
        phone,
        isSaving,
        isUploadingAvatar,
        isLocating,
        isProfileRateLimited,
        profileRateLimitMsg,
        isPhoneRateLimited,
        phoneRateLimitMsg,
        fileInputRef,
        handleDetectLocation,
        handleSaveProfile,
        handleAvatarSelect,
        triggerAvatarUpload,
        isPhoneModalOpen,
        phoneStep,
        setPhoneStep,
        modalPhone,
        selectedCountry,
        nationalPhone,
        handleModalCountryChange,
        handleModalNationalPhoneChange,
        otpCode,
        setOtpCode,
        isSendingOtp,
        isVerifyingOtp,
        countdown,
        openPhoneModal,
        closePhoneModal,
        handleSendPhoneOtp,
        handleVerifyOtp,
        sessions,
        breakdown,
        isLoadingSessions,
        revokingSessionId,
        isRevokingAll,
        handleRevokeSession,
        handleRevokeAllOtherSessions,
        refreshSessions,
    } = useProfileManager(initialProfile, initialSessions);

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Top Page Header */}
            <ProfileHeader />

            {/* Profile Hero Card */}
            <ProfileHeroCard
                profile={profile}
                name={name}
                phone={phone}
                address={address}
                isUploadingAvatar={isUploadingAvatar}
                onUploadClick={triggerAvatarUpload}
                fileInputRef={fileInputRef}
                onAvatarSelect={handleAvatarSelect}
            />

            {/* Middle Section: Personal Details Form (2 Cols) + Security Stats (1 Col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ProfileDetailsForm
                        name={name}
                        setName={setName}
                        email={profile?.email}
                        phone={phone}
                        address={address}
                        setAddress={setAddress}
                        isSaving={isSaving}
                        isLocating={isLocating}
                        isProfileRateLimited={isProfileRateLimited}
                        profileRateLimitMsg={profileRateLimitMsg}
                        onSave={handleSaveProfile}
                        onDetectLocation={handleDetectLocation}
                        onOpenPhoneModal={openPhoneModal}
                    />
                </div>

                <ProfileSecurityCards profile={profile} />
            </div>

            {/* Bottom Section: Active Device Sessions */}
            <ActiveSessionsSection
                sessions={sessions}
                breakdown={breakdown}
                isLoadingSessions={isLoadingSessions}
                revokingSessionId={revokingSessionId}
                isRevokingAll={isRevokingAll}
                onRevokeSession={handleRevokeSession}
                onRevokeAllOther={handleRevokeAllOtherSessions}
                onRefreshSessions={refreshSessions}
            />

            {/* Phone Verification Modal */}
            <PhoneVerificationModal
                isOpen={isPhoneModalOpen}
                phoneStep={phoneStep}
                setPhoneStep={setPhoneStep}
                modalPhone={modalPhone}
                selectedCountry={selectedCountry}
                nationalPhone={nationalPhone}
                onCountryChange={handleModalCountryChange}
                onNationalPhoneChange={handleModalNationalPhoneChange}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                countdown={countdown}
                isSendingOtp={isSendingOtp}
                isVerifyingOtp={isVerifyingOtp}
                isPhoneRateLimited={isPhoneRateLimited}
                phoneRateLimitMsg={phoneRateLimitMsg}
                userEmail={profile?.email}
                onClose={closePhoneModal}
                onSendOtp={handleSendPhoneOtp}
                onVerifyOtp={handleVerifyOtp}
            />
        </div>
    );
}
