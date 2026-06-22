<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/src/Exception.php';
require_once __DIR__ . '/src/PHPMailer.php';
require_once __DIR__ . '/src/SMTP.php';

function send_interview_email($to, $name, $interview_type, $interview_date, $notes) {
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration – CHANGE THESE
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'villaminqueenie@gmail.com';    
        $mail->Password   = 'pglb olbv wdgo buhx';      
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
        $mail->Port       = 587;
        
        $mail->setFrom('villaminqueenie@gmail.com', 'CKL Construction HR');
        $mail->addAddress($to, $name);
        
        $mail->isHTML(true);
        $mail->Subject = 'Interview Scheduled - CKL Construction';
        
        $date_obj = new DateTime($interview_date);
        $formatted_date = $date_obj->format('F d, Y');
        $formatted_time = $date_obj->format('g:i A');
        
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 16px;'>
                <div style='background: #1e4668; padding: 20px; border-radius: 16px 16px 0 0; color: white;'>
                    <h2 style='margin: 0;'>CKL Construction</h2>
                    <p style='margin: 0; font-size: 0.9rem; opacity: 0.8;'>Interview Invitation</p>
                </div>
                <div style='background: white; padding: 24px; border-radius: 0 0 16px 16px;'>
                    <p>Dear <strong>$name</strong>,</p>
                    <p>We are pleased to invite you for an interview with our team at CKL Construction.</p>
                    <div style='background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0;'>
                        <p style='margin: 4px 0;'><strong>Interview Type:</strong> $interview_type</p>
                        <p style='margin: 4px 0;'><strong>Date:</strong> $formatted_date</p>
                        <p style='margin: 4px 0;'><strong>Time:</strong> $formatted_time</p>
                        " . ($notes ? "<p style='margin: 4px 0;'><strong>Notes:</strong> $notes</p>" : "") . "
                    </div>
                    <p>Please confirm your availability by replying to this email.</p>
                    <p>We look forward to meeting you!</p>
                    <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;'>
                    <p style='font-size: 0.8rem; color: #5a6e7c;'>
                        CKL Construction Services<br>
                        <a href='https://cklconstruction.com' style='color: #2c7da0; text-decoration: none;'>Visit our website</a>
                    </p>
                </div>
            </div>
        ";
        
        $mail->AltBody = "Interview Scheduled:\nType: $interview_type\nDate: $formatted_date\nTime: $formatted_time" . ($notes ? "\nNotes: $notes" : "");
        
        $mail->send();
        return ['success' => true, 'message' => 'Email sent successfully'];
        
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Email error: ' . $mail->ErrorInfo];
    }
}
?>