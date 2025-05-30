import React from 'react';
import validate from 'helpers/validate';
import Form from 'molecules/Form';

const FormData = () => (
    <Form>
        <Form.Row label="Title" required>
            <Form.Control
                name="title"
                validators={[{
                    isValid: validate.required(),
                    message: 'Please enter a title.',
                }]}
            >
                <Form.Control.TextField />
            </Form.Control>
        </Form.Row>
    </Form>
);

export default FormData;
