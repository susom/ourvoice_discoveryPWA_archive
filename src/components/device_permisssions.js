import React, { useState, useRef, useEffect } from "react";
import usePermissions from './usePermissions';
import PermissionButton from './PermissionButton';
import {getDeviceType} from "./util";

import {Lock, MicFill, CameraVideoFill, GeoAltFill } from "react-bootstrap-icons";
import {Modal} from "react-bootstrap";

import "../assets/css/permissions.css";

function PermissionModal({ permissionNames , closeModal, onPermissionChanged, setShowAudioPermissionModal}) {
    const [permissions, loading, requestPermission, setPermissions] = usePermissions();
    const [modalIsOpen, setIsOpen] = useState(false);

    const loadingPermissions = Object.values(loading).some(v => v);
    const deniedPermissions = permissionNames.filter(permissionName => permissions[permissionName] === "denied");
    const deniedPermissionsString = deniedPermissions.join(', ');
    const device_type = getDeviceType();

    const permission_messaging = {
        "camera" : {"msg" : "The app requires use of the camera for taking photos of neighborhood features", "icon" : <CameraVideoFill size={40}/> },
        "audio" : {"msg" : "The app requires use of the microphone for recording observations of neighborhood features", "icon" : <MicFill size={40}/> },
        "geo" : {"msg" : "The app requires use of the geolocation data for mapping walks around the neighborhood", "icon" : <GeoAltFill size={40}/> },
    }

    useEffect(() => {
        if (loadingPermissions) return;

        const deniedPermissions         = permissionNames.filter(permissionName => permissions[permissionName] === "denied");
        const isPermissionNotGranted    = deniedPermissions.length > 0 || permissionNames.some(permissionName => permissions[permissionName] !== "granted");

        // Control Modal Open State
        setIsOpen(isPermissionNotGranted);
    }, [permissionNames, permissions, loadingPermissions]);


    // Create a ref
    const onPermissionChangedRef = useRef(null);

    // Sync it with the current onPermissionChanged function prop
    useEffect(() => {
        onPermissionChangedRef.current = onPermissionChanged;
    }, [onPermissionChanged]);

    useEffect(() => {
        if (loadingPermissions) return;

        const deniedPermissions         = permissionNames.filter(permissionName => permissions[permissionName] === "denied");
        const isPermissionNotGranted    = deniedPermissions.length > 0 || permissionNames.some(permissionName => permissions[permissionName] !== "granted");

        if (onPermissionChangedRef.current) {
            onPermissionChangedRef.current(!isPermissionNotGranted);
        }
    }, [permissionNames, permissions, loadingPermissions]);


    return (
        <Modal
            show={modalIsOpen}
            onHide={() => {
                if (!deniedPermissions.includes("geo") && !deniedPermissions.includes("camera")) {
                    setIsOpen(false);
                    closeModal();
                }
            }}
            className="permissions_spotCheck"
        >
            <Modal.Header>
                <Modal.Title>Required Device Permissions</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {deniedPermissions.length > 0 && (
                    <div>
                        <p>Essential {deniedPermissionsString} permission(s) have been denied. To re-enable:</p>

                        {device_type === 'Android' ? (
                            <>
                                <h5>On Android with Chrome:</h5>
                                <ul>
                                    <li>Tap the lock icon beside the URL.</li>
                                    <li>Select "Site Settings".</li>
                                    <li>Go to "Permissions".</li>
                                    <li>Set each required permission to "Allow".</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <h5>On iOS with Safari:</h5>
                                <ul>
                                    <li>Go to device "Settings".</li>
                                    <li>Select "Safari".</li>
                                    <li>Find "Settings for Websites".</li>
                                    <li>Tap "Clear History and Website Data".</li>
                                    <li>Adjust Permissions:
                                        <ul>
                                            <li>If OurVoice is listed, remove it.</li>
                                            <li>If not, set permissions to "Ask" or "Allow".</li>
                                        </ul>
                                    </li>
                                </ul>
                            </>
                        )}

                        <h5>If Installed to Home Screen:</h5>
                        <p>After adjusting browser permissions:</p>
                        <ul>
                            <li>Delete OurVoice app from home screen.</li>
                            <li>Reinstall via web browser.</li>
                        </ul>

                        <p>Doing so should re-enable the required permissions for OurVoice.</p>
                    </div>
                )}
                <div className="permissions">
                    {permissionNames.map(permissionName => (
                        permissions[permissionName] !== "denied" && (
                            <div key={permissionName}>
                                <PermissionButton
                                    permissionName={permissionName}
                                    isGranted={permissions[permissionName] === "granted"}
                                    isLoading={loading[permissionName]}
                                    onGrant={() => {
                                        requestPermission(permissionName)
                                    }}

                                    iconGranted={permission_messaging[permissionName]["icon"]}
                                    iconLocked={<Lock size={40}/>}
                                    description={permission_messaging[permissionName]["msg"]}
                                />
                            </div>
                        )
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default PermissionModal;
